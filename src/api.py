from fastapi.routing import APIRouter

chts = APIRouter()
prof = APIRouter()
from src.models import Profile, Message, Chat
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
async def createchat(chat: Chat):
    create_chat(chat)
    return "Chat created successfully!"

@chts.get("/my_messages_from_chat/{chat_id}")
async def mymessagesfromchat(chat_id: int):
    return get_messages(chat_id)