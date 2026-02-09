from fastapi.routing import APIRouter

app = APIRouter()
from src.models import Profile, Message, Chat
from src.db import get_users, my_profile

@app.get("/users")
def get_users_route():
    return get_users()

@app.get("/profile")
def my_profile_route(user_id: int):
    return my_profile(user_id)