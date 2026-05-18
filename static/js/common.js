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

async function apiPut(path, payload) {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = `PUT ${path} failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch (_) {
      // ignore JSON parse errors
    }
    throw new Error(detail);
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
    let detail = `POST ${path} failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch (_) {
      // ignore JSON parse errors
    }
    throw new Error(detail);
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
