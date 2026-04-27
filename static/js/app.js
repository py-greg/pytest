import { state } from './state.js';
import { initSocket } from './socket.js';
import {
    renderRegister,
    renderProfile,
    renderUsersList,
    renderChatsList,
    renderChatDetail
} from './views/views.js';

let currentRouteRenderToken = 0;
let lastHash = null;

async function router() {
    const hash = location.hash.slice(1) || '/';
    if (hash === lastHash) return;
    lastHash = hash;
    const renderToken = ++currentRouteRenderToken;
    const appDiv = document.getElementById('app');
    
    if (hash === 'register') {
        renderRegister(appDiv);
    } else if (hash === 'users') {
        renderUsersList(appDiv);
    } else if (hash === 'profile') {
        if (!state.getCurrentUserId()) location.hash = 'register';
        else renderProfile(appDiv);
    } else if (hash === 'chats') {
        if (!state.getCurrentUserId()) location.hash = 'register';
        else {
            await renderChatsList(appDiv);
            if (renderToken !== currentRouteRenderToken) return;
            initSocket();
        }
    } else if (hash.startsWith('chat/')) {
        const chatId = hash.split('/')[1];
        if (!state.getCurrentUserId()) location.hash = 'register';
        else {
            await renderChatDetail(appDiv, chatId);
            if (renderToken !== currentRouteRenderToken) return;
            initSocket();
        }
    } else {
        if (state.getCurrentUserId()) location.hash = 'chats';
        else location.hash = 'register';
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);