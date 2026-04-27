const API_BASE = window.location.origin;

async function request(url, options = {}) {
    const response = await fetch(`${API_BASE}${url}`, options);
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }
    return response.json();
}

export function registerProfile(profileData) {
    return request('/profile/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    });
}

export function getUsers() {
    return request('/profile/users');
}

export function getProfile(userId) {
    return request(`/profile/profile?user_id=${userId}`);
}

export function getMyChats(userId) {
    return request(`/chats/my_chats?user_id=${userId}`);
}

export function createChat(chatData) {
    return request('/chats/create_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData)
    });
}

export function getMessages(chatId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', String(options.limit));
    if (options.beforeId) params.set('before_id', String(options.beforeId));
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return request(`/chats/my_messages_from_chat/${chatId}${suffix}`);
}