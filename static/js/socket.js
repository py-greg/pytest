import { state } from './state.js';

let socket = null;

export function initSocket() {
    const userId = state.getCurrentUserId();
    if (!userId) return null;
    
    if (socket && socket.connected) return socket;
    
    socket = io('http://localhost:8000', {
        query: { user_id: userId }
    });
    
    socket.on('connect', () => {
        console.log('Socket.IO connected');
        const userChats = state.getChats();
        userChats.forEach(chat => {
            socket.emit('join_chat', { chat_id: chat.id });
        });
    });
    
    socket.on('new_message', (data) => {
        const { chat_id, message } = data;
        state.addMessage(chat_id, message);
        
        const currentHash = location.hash;
        if (currentHash === `#chat/${chat_id}`) {
            import('./views/views.js').then(module => {
                module.appendMessage(chat_id, message);
            });
        }
    });
    
    socket.on('chat_created', (chat) => {
        const currentChats = state.getChats();
        state.setChats([...currentChats, chat]);
        if (location.hash === '#chats') {
            import('./views/views.js').then(module => {
                module.refreshChatsList();
            });
        }
    });
    
    return socket;
}

export function getSocket() {
    if (!socket) return initSocket();
    return socket;
}