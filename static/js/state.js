let currentUserId = localStorage.getItem('userId') || null;
let currentUserProfile = null;
let chats = [];
let messages = {};

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
    setChats: (newChats) => { chats = newChats; },
    getMessages: (chatId) => messages[chatId] || [],
    setMessages: (chatId, msgList) => { messages[chatId] = msgList; },
    addMessage: (chatId, message) => {
        if (!messages[chatId]) messages[chatId] = [];
        messages[chatId].push(message);
    }
};