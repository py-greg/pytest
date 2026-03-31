from pydantic import BaseModel

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
    sender: str
    sender_id: int
    receiver: str
    receiver_id: int
    message: str

#chat model
class Chat(BaseModel):
    id: int = -1
    name: str
    