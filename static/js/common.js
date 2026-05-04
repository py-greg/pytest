const STORAGE_KEYS = {
  user: "messenger_user",
  chat: "messenger_chat",
};

async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.status}`);
  }
  return res.json();
}

function setStoredUser(user) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
}

function setStoredChat(chat) {
  localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(chat));
}

function getStoredChat() {
  const raw = localStorage.getItem(STORAGE_KEYS.chat);
  return raw ? JSON.parse(raw) : null;
}

function clearStoredChat() {
  localStorage.removeItem(STORAGE_KEYS.chat);
}
