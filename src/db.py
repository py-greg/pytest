from typing import List
import mariadb
from src.models import Message, Profile

conn = mariadb.connect(
    host="84.38.180.130",
    port=3306,
    user="greg",
    password="Wasthatthebiteof87",
    database="greg_db",
    autocommit=False
)

def get_users() -> List[Profile]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    return [Profile(**row) for row in cursor]

def my_profile(user_id: int) -> Profile:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    return Profile(**cursor.fetchone())

#def get_chats() -> 
