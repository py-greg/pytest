import { state } from './state.js';

let socket = null;

export function initSocket() {
    const userId = state.getCurrentUserId();
    if (!userId) return null;
    if (typeof window.io !== 'function') {
        console.error('Socket.IO client is not loaded.');
        return null;
    }
    
    if (socket) {
        if (socket.connected) return socket;
        socket.connect();
        return socket;
    }
    
    socket = window.io(window.location.origin, {
        query: { user_id: userId }
    });
    
    socket.on('connect', () => {
        console.log('Socket.IO connected');
    });
    
    socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO connect error:', error?.message || error);
    });
    
    socket.on('message', (data) => {
        // Server connect ack event.
        console.log('Socket message:', data);
    });

    socket.on('chat_response', (data) => {
        if (data?.error) {
            alert(`Socket error: ${data.error}`);
        } else {
            console.log('Chat response:', data?.data || data);
        }
    });

    socket.on('new_message', (data) => {
        const { chat_id, message } = data || {};
        if (!chat_id || !message) return;
        state.addMessage(chat_id, message);

        if (location.hash === `#chat/${chat_id}`) {
            import('./views/views.js').then(module => {
                module.appendMessage(chat_id, message);
            });
        }
    });
    
    return socket;
}

export function getSocket() {
    if (!socket) return initSocket();
    return socket;
}

export function ensureSocketConnected(timeoutMs = 5000) {
    const currentSocket = getSocket();
    if (!currentSocket) return Promise.resolve(null);
    if (currentSocket.connected) return Promise.resolve(currentSocket);

    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            cleanup();
            resolve(null);
        }, timeoutMs);

        const onConnect = () => {
            cleanup();
            resolve(currentSocket);
        };

        const onError = () => {
            cleanup();
            resolve(null);
        };

        const cleanup = () => {
            clearTimeout(timer);
            currentSocket.off('connect', onConnect);
            currentSocket.off('connect_error', onError);
        };

        currentSocket.on('connect', onConnect);
        currentSocket.on('connect_error', onError);
    });
}