function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

export function createMessageElement(message, isOwn) {
    const div = document.createElement('div');
    div.className = `message ${isOwn ? 'own' : ''}`;
    div.innerHTML = `
        <div>${escapeHtml(message.text)}</div>
        <small>${message.created_at || ''}</small>
    `;
    return div;
}

export function createChatItemElement(chat, onClick) {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.textContent = chat.name;
    div.dataset.id = chat.id;
    div.addEventListener('click', () => onClick(chat.id));
    return div;
}

export function createUserItemElement(user, onClick) {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.textContent = `${user.name} (${user.email})`;
    div.dataset.id = user.id;
    div.addEventListener('click', () => onClick(user.id));
    return div;
}