const chatTitle = document.getElementById("chat-title");
const chatMeta = document.getElementById("chat-meta");
const statusBox = document.getElementById("status");
const messagesBox = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const backBtn = document.getElementById("back-btn");
const memberList = document.getElementById("member-list");
const currentMembersList = document.getElementById("current-members");
const addMembersBtn = document.getElementById("add-members-btn");

const user = getStoredUser();
const chat = getStoredChat();

if (!user || !user.id) {
  window.location.href = "/static/profile.html";
}
if (!chat || !chat.id) {
  window.location.href = "/static/chats.html";
}

let socket = null;

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

  currentMembersList.innerHTML = "";
  for (const member of currentMembers) {
    const li = document.createElement("li");
    li.textContent = `${member.id}: ${member.name}`;
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

backBtn.addEventListener("click", () => {
  window.location.href = "/static/chats.html";
});

messageForm.addEventListener("submit", sendMessage);
addMembersBtn.addEventListener("click", () => {
  addMembers().catch((err) => {
    statusBox.textContent = err.message;
  });
});

chatTitle.textContent = chat.name;
chatMeta.textContent = `Step 3 of 3 | ${user.name} (${user.id})`;

Promise.all([loadMessages(), loadMemberCandidates()])
  .then(() => setupSocket())
  .catch((err) => {
    statusBox.textContent = err.message;
  });
