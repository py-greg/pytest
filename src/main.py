from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
import socketio

from src.api import chts, prof

sio = socketio.AsyncServer(async_mode="asgi")
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

# Обработчик подключения клиента
@sio.event
async def connect(sid, environ):
    print(f"Клиент подключился: {sid}")
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
    print(f"Сообщение чата от {sid}: {data}")
    # Отправляем ответ конкретному клиенту
    await sio.emit("chat_response", {"data": "Сообщение получено"}, room=sid)
    # Если нужно отправить сообщение всем клиентам:
    #await sio.emit("chat_response", {"data": "Новое сообщение"}, broadcast=True)

if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4444)