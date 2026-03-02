from fastapi.routing import APIRouter

chts = APIRouter(chts)
prof = APIRouter(prof)
from src.models import Profile, Message, Chat
from src.db import get_users, my_profile

@prof.get("/users")
async def get_users():
    return get_users()

@prof.get("/profile")
async def my_profile(user_id: int):
    return my_profile(user_id)

@chts.get("/my_chats")
async def my_chats(user_id: int):
    return get_chats(user_id)

@prof.post("/register")
async def register(user: Profile):
    register_user(user)
    return "User registered successfully!"

@chts.post("/create_chat")
async def create_chat(chat: Chat):
    create_chat(chat)
    return "Chat created successfully!"

@chts.get("/my_messages_from_chat/{chat_id}")
async def my_messages_from_chat(chat_id: int):
    return get_messages(chat_id)