import { registerProfile, getUsers, getProfile, getMyChats, createChat, getMessages } from '../api.js';
import { state } from '../state.js';
import { getSocket, ensureSocketConnected } from '../socket.js';
import { createMessageElement, createChatItemElement, createUserItemElement } from './components.js';

// ----------------------------------------------------------------------
// 1. Регистрация
// ----------------------------------------------------------------------
export function renderRegister(container) {
    container.innerHTML = `
        <h2 style="text-align:center; margin:20px;">Register</h2>
        <form id="register-form">
            <input name="name" placeholder="Full Name" required>
            <input name="age" type="number" placeholder="Age" required>
            <input name="email" type="email" placeholder="Email" required>
            <input name="phone" placeholder="Phone" required>
            <input name="country" placeholder="Country" required>
            <button type="submit">Register</button>
        </form>
        <p style="text-align:center;">Already have an account? <a href="#users">Login here</a></p>
    `;
    
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const profile = Object.fromEntries(formData.entries());
        try {
            const newProfile = await registerProfile(profile);
            state.setCurrentUser(newProfile.id, newProfile);
            location.hash = 'chats';
        } catch (err) {
            alert('Registration failed: ' + err.message);
        }
    });
}

// ----------------------------------------------------------------------
// 2. Профиль текущего пользователя
// ----------------------------------------------------------------------
export async function renderProfile(container) {
    const userId = state.getCurrentUserId();
    let profile = state.getCurrentUserProfile();
    if (!profile) {
        try {
            profile = await getProfile(userId);
            state.setCurrentUser(userId, profile);
        } catch (err) {
            container.innerHTML = `<p>Error loading profile: ${err.message}</p>`;
            return;
        }
    }
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h2>My Profile</h2>
            <p><strong>Name:</strong> ${profile.name}</p>
            <p><strong>Age:</strong> ${profile.age}</p>
            <p><strong>Email:</strong> ${profile.email}</p>
            <p><strong>Phone:</strong> ${profile.phone}</p>
            <p><strong>Country:</strong> ${profile.country}</p>
            <button id="logout-btn">Logout</button>
            <button id="back-to-chats">Back to Chats</button>
        </div>
    `;
    
    document.getElementById('logout-btn').onclick = () => {
        state.setCurrentUser(null, null);
        location.hash = 'register';
    };
    document.getElementById('back-to-chats').onclick = () => {
        location.hash = 'chats';
    };
}

// ----------------------------------------------------------------------
// 3. Список всех пользователей (для входа)
// ----------------------------------------------------------------------
export async function renderUsersList(container) {
    let users = [];
    const usersCacheFresh = typeof state.isUsersCacheFresh === 'function' ? state.isUsersCacheFresh() : false;
    const usersCache = typeof state.getUsersCache === 'function' ? state.getUsersCache() : [];
    if (usersCacheFresh && usersCache.length > 0) {
        users = usersCache;
    } else {
        try {
            users = await getUsers();
            state.setUsersCache(users);
        } catch (err) {
            container.innerHTML = `<p>Failed to load users: ${err.message}</p>`;
            return;
        }
    }
    
    container.innerHTML = `
        <div style="padding:10px;">
            <h2>Select User to Login</h2>
            <div id="users-container"></div>
            <button id="register-btn">Register New User</button>
        </div>
    `;
    
    const usersDiv = document.getElementById('users-container');
    usersDiv.innerHTML = '';
    users.forEach(user => {
        const item = createUserItemElement(user, async (userId) => {
            try {
                const profile = await getProfile(userId);
                state.setCurrentUser(userId, profile);
                location.hash = 'chats';
            } catch (err) {
                alert('Cannot fetch profile: ' + err.message);
            }
        });
        usersDiv.appendChild(item);
    });
    
    document.getElementById('register-btn').onclick = () => {
        location.hash = 'register';
    };
}

// ----------------------------------------------------------------------
// 4. Список чатов текущего пользователя
// ----------------------------------------------------------------------
export async function renderChatsList(container) {
    const userId = state.getCurrentUserId();
    const chatsCacheFresh = typeof state.isChatsCacheFresh === 'function' ? state.isChatsCacheFresh() : false;
    if (!chatsCacheFresh || state.getChats().length === 0) {
        try {
            const chats = await getMyChats(userId);
            state.setChats(chats);
        } catch (err) {
            container.innerHTML = `<p>Error: ${err.message}</p>`;
            return;
        }
    }
    
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px;">
            <h2>My Chats</h2>
            <button id="new-chat">+ New Chat</button>
            <button id="profile-btn">Profile</button>
        </div>
        <div id="chats-container"></div>
    `;
    
    renderChatsListContent();
    
    document.getElementById('new-chat').onclick = () => showCreateChatModal();
    document.getElementById('profile-btn').onclick = () => location.hash = 'profile';
}

function renderChatsListContent() {
    const chats = state.getChats();
    const containerDiv = document.getElementById('chats-container');
    if (!containerDiv) return;
    
    containerDiv.innerHTML = '';
    chats.forEach(chat => {
        const item = createChatItemElement(chat, (chatId) => {
            location.hash = `chat/${chatId}`;
        });
        containerDiv.appendChild(item);
    });
}

async function showCreateChatModal() {
    const name = prompt('Enter chat name:');
    if (!name) return;
    try {
        const newChat = await createChat({ name, user_ids: [] });
        const currentChats = state.getChats();
        state.setChats([...currentChats, newChat]);
        renderChatsListContent();
        
        const socket = getSocket();
        if (socket) socket.emit('chat_created_client', newChat);
    } catch (err) {
        alert('Failed to create chat: ' + err.message);
    }
}

export function refreshChatsList() {
    renderChatsListContent();
}

// ----------------------------------------------------------------------
// 5. Детали чата (сообщения)
// ----------------------------------------------------------------------
let currentChatId = null;
let socket = null;

export async function renderChatDetail(container, chatId) {
    currentChatId = parseInt(chatId);
    socket = getSocket();
    
    const hasMessages = typeof state.hasMessages === 'function' ? state.hasMessages(currentChatId) : state.getMessages(currentChatId).length > 0;
    if (!hasMessages) {
        try {
            const messages = await getMessages(currentChatId, { limit: 100 });
            state.setMessages(currentChatId, messages);
        } catch (err) {
            console.warn('Could not load messages', err);
        }
    }
    
    container.innerHTML = `
        <div id="messages-area"></div>
        <form id="message-form">
            <input id="msg-text" placeholder="Type message..." required autocomplete="off">
            <button type="submit">Send</button>
        </form>
        <button id="back">← Back to chats</button>
    `;
    
    renderMessages(currentChatId);
    
    const form = document.getElementById('message-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('msg-text');
        const text = input.value.trim();
        if (!text) return;

        const connectedSocket = await ensureSocketConnected();
        if (!connectedSocket) {
            alert('Socket not connected. Cannot send message.');
            return;
        }

        connectedSocket.emit('chat_message', {
            chat_id: currentChatId,
            text: text,
            sender_id: state.getCurrentUserId()
        });
        input.value = '';
    });
    
    document.getElementById('back').onclick = () => location.hash = 'chats';
}

function renderMessages(chatId) {
    const messages = state.getMessages(chatId);
    const currentUserId = state.getCurrentUserId();
    const area = document.getElementById('messages-area');
    if (!area) return;
    
    area.innerHTML = '';
    messages.forEach(msg => {
        const isOwn = msg.sender_id === currentUserId;
        const msgElement = createMessageElement(msg, isOwn);
        area.appendChild(msgElement);
    });
    area.scrollTop = area.scrollHeight;
}

export function appendMessage(chatId, message) {
    if (currentChatId === chatId) {
        const area = document.getElementById('messages-area');
        if (area) {
            const isOwn = message.sender_id === state.getCurrentUserId();
            const msgElement = createMessageElement(message, isOwn);
            area.appendChild(msgElement);
            area.scrollTop = area.scrollHeight;
        }
    }
}