const selectedUserBox = document.getElementById("selected-user");
const chatList = document.getElementById("chat-list");
const chatUsers = document.getElementById("chat-users");
const chatNameInput = document.getElementById("chat-name");
const createChatBtn = document.getElementById("create-chat-btn");
const backBtn = document.getElementById("back-btn");
const statusBox = document.getElementById("status");

const user = getStoredUser();
if (!user || !user.id) {
  window.location.href = "/static/profile.html";
}

async function loadUsers() {
  const users = await apiGet("/profile/users");
  chatUsers.innerHTML = "";
  for (const item of users) {
    const row = document.createElement("label");
    row.className = "checkbox-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(item.id);
    checkbox.checked = item.id === user.id;
    if (item.id === user.id) {
      checkbox.disabled = true;
    }

    const text = document.createElement("span");
    text.textContent = `${item.id}: ${item.name}`;

    row.appendChild(checkbox);
    row.appendChild(text);
    chatUsers.appendChild(row);
  }
}

function renderChats(chats) {
  chatList.innerHTML = "";
  if (!chats.length) {
    const empty = document.createElement("li");
    empty.textContent = "No chats yet.";
    chatList.appendChild(empty);
    return;
  }

  for (const chat of chats) {
    const li = document.createElement("li");
    li.textContent = `${chat.id}: ${chat.name}`;
    li.addEventListener("click", () => {
      setStoredChat(chat);
      window.location.href = "/static/chat.html";
    });
    chatList.appendChild(li);
  }
}

async function loadChats() {
  selectedUserBox.textContent = `Step 2 of 3 | ${user.name} (${user.id})`;
  const chats = await apiGet(`/chats/my_chats?user_id=${user.id}`);
  renderChats(chats);
}

async function createChat() {
  const name = chatNameInput.value.trim();
  if (!name) {
    alert("Enter chat name.");
    return;
  }
  const selectedUsers = Array.from(chatUsers.querySelectorAll('input[type="checkbox"]:checked')).map((el) => Number(el.value));
  const userIds = Array.from(new Set([user.id, ...selectedUsers].filter(Boolean)));
  await apiPost("/chats/create_chat", { name, user_ids: userIds });
  chatNameInput.value = "";
  await loadChats();
}

createChatBtn.addEventListener("click", () => {
  createChat().catch((err) => {
    statusBox.textContent = err.message;
  });
});

backBtn.addEventListener("click", () => {
  window.location.href = "/static/profile.html";
});

Promise.all([loadUsers(), loadChats()]).catch((err) => {
  statusBox.textContent = err.message;
});
