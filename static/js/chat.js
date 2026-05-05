const chatTitle = document.getElementById("chat-title");
const chatMeta = document.getElementById("chat-meta");
const statusBox = document.getElementById("status");
const messagesBox = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const backBtn = document.getElementById("back-btn");
const deleteChatBtn = document.getElementById("delete-chat-btn");
const memberList = document.getElementById("member-list");
const currentMembersList = document.getElementById("current-members");
const addMembersBtn = document.getElementById("add-members-btn");
const addMembersSection = addMembersBtn.closest("section");

const user = getStoredUser();
const chat = getStoredChat();

if (!user || !user.id) {
  window.location.href = "/static/profile.html";
}
if (!chat || !chat.id) {
  window.location.href = "/static/chats.html";
}

let socket = null;
let canRead = false;
let canWrite = false;
let canAdmin = false;

function parsePermissionSet(permissionString) {
  return new Set(
    String(permissionString || "")
      .split(";")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

function normalizePermissionString(permissionString) {
  const allowed = new Set(["read", "write", "admin"]);
  const parts = Array.from(
    new Set(
      String(permissionString || "")
        .split(";")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => allowed.has(item))
    )
  );
  return parts.join(";");
}

function createPermissionEditor(member) {
  const editor = document.createElement("div");
  editor.className = "perm-editor";
  const permissionSet = parsePermissionSet(member.permission);
  const toggles = ["read", "write", "admin"];

  for (const permission of toggles) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `perm-toggle ${permissionSet.has(permission) ? "active" : ""}`;
    btn.textContent = permission;
    btn.dataset.permission = permission;
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
    editor.appendChild(btn);
  }

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "perm-save";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", async () => {
    const selected = Array.from(editor.querySelectorAll(".perm-toggle.active")).map((el) => el.dataset.permission);
    const permission = normalizePermissionString(selected.join(";"));
    const payload = {
      chat_id: chat.id,
      actor_user_id: user.id,
      target_user_id: member.id,
      permission,
    };
    await apiPost("/chats/update_member_permissions", payload);
    statusBox.textContent = `Permissions updated for ${member.name}`;
    await loadMemberCandidates();
  });
  editor.appendChild(saveBtn);

  return editor;
}

function applyPermissionUI() {
  if (!canRead) {
    messagesBox.innerHTML = "";
    const noRead = document.createElement("article");
    noRead.className = "message";
    noRead.textContent = "You do not have read permission for this chat.";
    messagesBox.appendChild(noRead);
  }

  messageInput.disabled = !canWrite;
  const sendBtn = messageForm.querySelector('button[type="submit"]');
  if (sendBtn) {
    sendBtn.disabled = !canWrite;
  }
  if (!canWrite) {
    messageInput.placeholder = "No write permission";
  }

  addMembersBtn.disabled = !canAdmin;
  memberList.style.opacity = canAdmin ? "1" : "0.5";
  if (addMembersSection) {
    addMembersSection.style.display = canAdmin ? "" : "none";
  }
  deleteChatBtn.style.display = canAdmin ? "" : "none";
}

function renderMessage(message) {
  const box = document.createElement("article");
  box.className = "message";
  if (message.sender_id === user.id) {
    box.classList.add("mine");
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  const created = message.created_at ? ` | ${message.created_at}` : "";
  meta.textContent = `${message.sender_name || `User ${message.sender_id}`}${created}`;
  box.appendChild(meta);

  const text = document.createElement("div");
  text.textContent = message.text || "";
  box.appendChild(text);

  messagesBox.appendChild(box);
}

function scrollToBottom() {
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function loadMessages() {
  if (!canRead) {
    return;
  }
  const list = await apiGet(`/chats/my_messages_from_chat/${chat.id}?limit=200`);
  messagesBox.innerHTML = "";
  for (const message of list) {
    renderMessage(message);
  }
  scrollToBottom();
}

async function loadMemberCandidates() {
  const [users, chats] = await Promise.all([
    apiGet("/profile/users"),
    apiGet(`/chats/my_chats?user_id=${user.id}`),
  ]);
  const selectedChat = chats.find((item) => item.id === chat.id);
  if (!selectedChat) {
    statusBox.textContent = "You are not a member of this chat.";
    return;
  }

  const currentMembers = await apiGet(`/chats/members/${chat.id}?actor_user_id=${user.id}`);
  const currentMemberIds = new Set(currentMembers.map((item) => item.id));
  const me = currentMembers.find((item) => item.id === user.id);
  const permissionSet = parsePermissionSet(me ? me.permission : "");
  canRead = permissionSet.has("read");
  canWrite = permissionSet.has("write");
  canAdmin = permissionSet.has("admin");
  applyPermissionUI();

  currentMembersList.innerHTML = "";
  for (const member of currentMembers) {
    const li = document.createElement("li");
    const title = document.createElement("div");
    title.textContent = `${member.id}: ${member.name} (${member.permission || "no permissions"})`;
    li.appendChild(title);

    if (canAdmin && member.id !== user.id) {
      li.appendChild(createPermissionEditor(member));
    }
    currentMembersList.appendChild(li);
  }

  memberList.innerHTML = "";
  for (const item of users) {
    if (currentMemberIds.has(item.id)) {
      continue;
    }
    const row = document.createElement("label");
    row.className = "checkbox-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(item.id);
    checkbox.checked = false;

    const text = document.createElement("span");
    text.textContent = `${item.id}: ${item.name}`;

    row.appendChild(checkbox);
    row.appendChild(text);
    memberList.appendChild(row);
  }
}

function setupSocket() {
  socket = io("/", {
    transports: ["websocket", "polling"],
    query: { user_id: String(user.id) },
  });

  socket.on("connect", () => {
    statusBox.textContent = "Connected";
  });

  socket.on("disconnect", () => {
    statusBox.textContent = "Disconnected";
  });

  socket.on("chat_response", (payload) => {
    if (payload.error) {
      statusBox.textContent = payload.error;
      return;
    }
    statusBox.textContent = payload.data || "";
  });

  socket.on("new_message", (payload) => {
    if (!payload || payload.chat_id !== chat.id) return;
    renderMessage(payload.message);
    scrollToBottom();
  });
}

function sendMessage(event) {
  event.preventDefault();
  if (!canWrite) {
    return;
  }
  if (!socket) return;
  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit("chat_message", {
    chat_id: chat.id,
    text,
  });
  messageInput.value = "";
}

async function addMembers() {
  if (!canAdmin) {
    return;
  }
  const selectedUserIds = Array.from(memberList.querySelectorAll('input[type="checkbox"]:checked')).map((el) => Number(el.value));
  if (!selectedUserIds.length) {
    alert("Select at least one member.");
    return;
  }
  const payload = {
    chat_id: chat.id,
    actor_user_id: user.id,
    user_ids: selectedUserIds,
  };
  const result = await apiPost("/chats/add_members", payload);
  statusBox.textContent = `Added ${result.added} member(s)`;
  await loadMemberCandidates();
}

async function deleteCurrentChat() {
  if (!canAdmin) {
    return;
  }
  const isConfirmed = window.confirm("Delete this chat and all its messages?");
  if (!isConfirmed) {
    return;
  }
  const payload = {
    chat_id: chat.id,
    actor_user_id: user.id,
  };
  const result = await apiPost("/chats/delete_chat", payload);
  if (socket) {
    socket.disconnect();
  }
  clearStoredChat();
  statusBox.textContent = `Deleted chat. Messages: ${result.messages_deleted}`;
  window.location.href = "/static/chats.html";
}

backBtn.addEventListener("click", () => {
  window.location.href = "/static/chats.html";
});

messageForm.addEventListener("submit", sendMessage);
addMembersBtn.addEventListener("click", () => {
  addMembers().catch((err) => {
    statusBox.textContent = err.message;
  });
});
deleteChatBtn.addEventListener("click", () => {
  deleteCurrentChat().catch((err) => {
    statusBox.textContent = err.message;
  });
});

chatTitle.textContent = chat.name;
chatMeta.textContent = `Step 3 of 3 | ${user.name} (${user.id})`;

loadMemberCandidates()
  .then(() => loadMessages())
  .then(() => {
    if (canRead || canWrite) {
      setupSocket();
    }
    if (!canRead && !canWrite && !canAdmin) {
      statusBox.textContent = "No permissions for this chat.";
    }
  })
  .catch((err) => {
    statusBox.textContent = err.message;
  });
