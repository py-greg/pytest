from typing import List, Optional
from pydantic import BaseModel, Field

#profile model
class Profile(BaseModel):
    id: int = -1
    name: str
    age: int
    email: str
    phone: str
    country: str

#message model
class Message(BaseModel):
    id: int = -1
    chat_id: int
    sender_id: int
    sender_name: str = ""
    receiver_id: Optional[int] = None
    text: str
    created_at: str = ""

#chat model
class Chat(BaseModel):
    id: int = -1
    name: str

class ChatCreate(BaseModel):
    name: str
    user_ids: List[int] = Field(default_factory=list)


class ChatMembersUpdate(BaseModel):
    chat_id: int
    user_ids: List[int] = Field(default_factory=list)
    actor_user_id: int