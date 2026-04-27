let currentUserId = localStorage.getItem('userId') || null;
let currentUserProfile = null;
let chats = [];
let messages = {};
let usersCache = [];
let usersFetchedAt = 0;
let chatsFetchedAt = 0;
const CACHE_TTL_MS = 30000;

export const state = {
    getCurrentUserId: () => currentUserId,
    getCurrentUserProfile: () => currentUserProfile,
    setCurrentUser: (id, profile) => {
        currentUserId = id;
        currentUserProfile = profile;
        if (id) localStorage.setItem('userId', id);
        else localStorage.removeItem('userId');
    },
    getChats: () => chats,
    setChats: (newChats) => {
        chats = newChats;
        chatsFetchedAt = Date.now();
    },
    isChatsCacheFresh: () => Date.now() - chatsFetchedAt < CACHE_TTL_MS,
    getMessages: (chatId) => messages[chatId] || [],
    setMessages: (chatId, msgList) => { messages[chatId] = msgList; },
    addMessage: (chatId, message) => {
        if (!messages[chatId]) messages[chatId] = [];
        messages[chatId].push(message);
    },
    hasMessages: (chatId) => (messages[chatId] || []).length > 0,
    getUsersCache: () => usersCache,
    setUsersCache: (users) => {
        usersCache = users;
        usersFetchedAt = Date.now();
    },
    isUsersCacheFresh: () => Date.now() - usersFetchedAt < CACHE_TTL_MS,
};