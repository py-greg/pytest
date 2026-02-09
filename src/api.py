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