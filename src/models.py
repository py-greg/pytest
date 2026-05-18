from typing import List, Optional
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
    creator_user_id: int
    user_ids: List[int] = Field(default_factory=list)


#chat members update model
class ChatMembersUpdate(BaseModel):
    chat_id: int
    user_ids: List[int] = Field(default_factory=list)
    actor_user_id: int


#chat delete model
class ChatDelete(BaseModel):
    chat_id: int
    actor_user_id: int

#chat members perms update model
class ChatMemberPermissionUpdate(BaseModel):
    chat_id: int
    actor_user_id: int
    target_user_id: int
    permission: str

class RegisterRequest(BaseModel):
    name: str
    age: int
    email: str
    phone: str
    country: str
    password: str = Field(min_length=4)


class LoginRequest(BaseModel):
    user_id: int
    input_password: str = Field(min_length=1)


class ProfileUpdate(BaseModel):
    id: int
    name: str
    age: int
    email: str
    phone: str
    country: str
    new_password: Optional[str] = None

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None
        if len(value) < 4:
            raise ValueError("Password must be at least 4 characters")
        return value