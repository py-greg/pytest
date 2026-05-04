from fastapi.routing import APIRouter
from fastapi import HTTPException
from typing import Optional

chts = APIRouter()
prof = APIRouter()
from src.models import Profile, Message, ChatCreate, Chat, ChatMembersUpdate
from src.db import get_users, my_profile, get_chats, register_user, create_chat, get_messages, add_users_to_chat, user_in_chat, get_chat_members

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


@chts.post("/add_members")
async def addmembers(payload: ChatMembersUpdate):
    if not payload.user_ids:
        raise HTTPException(status_code=400, detail="user_ids is empty")
    if not user_in_chat(payload.actor_user_id, payload.chat_id):
        raise HTTPException(status_code=403, detail="Access denied for this chat")
    inserted = add_users_to_chat(payload.chat_id, payload.user_ids)
    return {"added": inserted}


@chts.get("/members/{chat_id}")
async def chatmembers(chat_id: int, actor_user_id: int):
    if not user_in_chat(actor_user_id, chat_id):
        raise HTTPException(status_code=403, detail="Access denied for this chat")
    return get_chat_members(chat_id)

@chts.get("/my_messages_from_chat/{chat_id}")
async def mymessagesfromchat(chat_id: int, limit: int = 100, before_id: Optional[int] = None):
    return get_messages(chat_id, limit=limit, before_id=before_id)