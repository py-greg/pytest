from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
import socketio
import asyncio
from functools import partial

from src.api import chts, prof
from src.db import get_user_chat_ids, user_in_chat, save_message, get_user_name, ensure_indexes

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(prof, prefix="/profile")
app.include_router(chts, prefix="/chats")
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Список разрешённых источников
    allow_credentials=True,       # Разрешить куки и заголовки авторизации
    allow_methods=["*"],          # Разрешить все HTTP методы (GET, POST, PUT, DELETE, OPTIONS...)
    allow_headers=["*"],          # Разрешить все заголовки
)


async def run_db(func, *args, **kwargs):
    loop = asyncio.get_running_loop()
    bound = partial(func, *args, **kwargs)
    return await loop.run_in_executor(None, bound)


# Обработчик подключения клиента
@sio.event
async def connect(sid, environ):
    query = environ.get("QUERY_STRING", "")
    params = dict(part.split("=", 1) for part in query.split("&") if "=" in part)
    raw_user_id = params.get("user_id")
    try:
        user_id = int(raw_user_id) if raw_user_id is not None else None
    except ValueError:
        user_id = None
    if user_id is None:
        return False

    user_name = await run_db(get_user_name, user_id)
    await sio.save_session(sid, {"user_id": user_id, "user_name": user_name})
    for chat_id in await run_db(get_user_chat_ids, user_id):
        await sio.enter_room(sid, f"chat_{chat_id}")
    print(f"Клиент подключился: {sid} (user_id={user_id})")
    await sio.emit("message", {"data": "Вы подключены"}, room=sid)

# Обработчик отключения клиента
@sio.event
async def disconnect(sid):
    print(f"Клиент отключился: {sid}")

# Обработчик стандартного события "message"
@sio.event
async def message(sid, data):
    print(f"Стандартное сообщение от {sid}: {data}")

# Обработчик пользовательского события "chat_message"
@sio.on("chat_message") 
async def handle_chat_message(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if user_id is None:
        await sio.emit("chat_response", {"error": "Unauthorized"}, room=sid)
        return

    chat_id = data.get("chat_id")
    text = (data.get("text") or "").strip()
    if not isinstance(chat_id, int) or not text:
        await sio.emit("chat_response", {"error": "Invalid payload"}, room=sid)
        return
    if not await run_db(user_in_chat, user_id, chat_id):
        await sio.emit("chat_response", {"error": "Access denied for this chat"}, room=sid)
        return

    saved_message = await run_db(
        save_message,
        chat_id=chat_id,
        sender_id=user_id,
        text=text,
        sender_name=session.get("user_name", ""),
    )
    message_payload = saved_message.model_dump() if hasattr(saved_message, "model_dump") else saved_message.dict()
    payload = {
        "chat_id": chat_id,
        "message": message_payload,
    }
    print(f"Сообщение чата от {sid}: {payload}")
    await sio.emit("new_message", payload, room=f"chat_{chat_id}")
    await sio.emit("chat_response", {"data": "Сообщение отправлено"}, room=sid)

if __name__ == '__main__':
    import uvicorn
    ensure_indexes()

    uvicorn.run(socket_app, host="0.0.0.0", port=4444)