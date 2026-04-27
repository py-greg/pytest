from fastapi.routing import APIRouter
from typing import Optional

chts = APIRouter()
prof = APIRouter()
from src.models import Profile, Message, ChatCreate, Chat
from src.db import get_users, my_profile, get_chats, register_user, create_chat, get_messages

#all functions are self-explanatory
@prof.get("/users")
async def getusers():
    return get_users()

@prof.get("/profile")
async def myprofile(user_id: int):
    return my_profile(user_id)

@chts.get("/my_chats")
async def mychats(user_id: int):
    return get_chats(user_id)

@prof.post("/register")
async def register(user: Profile):
    register_user(user)
    return "User registered successfully!"

@chts.post("/create_chat")
async def createchat(chat: ChatCreate):
    return create_chat(chat)

@chts.get("/my_messages_from_chat/{chat_id}")
async def mymessagesfromchat(chat_id: int, limit: int = 100, before_id: Optional[int] = None):
    return get_messages(chat_id, limit=limit, before_id=before_id)