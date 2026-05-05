from typing import List, Optional, Tuple
from pydantic import BaseModel, Field, field_validator

#profile model
class Profile(BaseModel):
    id: int = -1
    name: str
    age: int
    email: str
    phone: str
    country: str


class ChatMember(BaseModel):
    id: int = -1
    name: str
    permission: str = ""

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

#chat create model
class ChatCreate(BaseModel):
    name: str
    user_ids: List[Tuple[int, str]] = Field(default_factory=list)

    @field_validator("user_ids")
    @classmethod
    def validate_permissions(cls, value):
        for user_id, permissions in value:
            if not permissions:
                raise ValueError("permissions string cannot be empty")
            # optional: ensure semicolon-separated tokens are non-empty
            parts = permissions.split(";")
            if any(not p.strip() for p in parts):
                raise ValueError(
                    f"invalid permissions format for user_id={user_id}; use 'perm1;perm2'"
                )
        return value


#chat members update model
class ChatMembersUpdate(BaseModel):
    chat_id: int
    user_ids: List[int] = Field(default_factory=list)
    actor_user_id: int


#chat delete model
class ChatDelete(BaseModel):
    chat_id: int
    actor_user_id: int