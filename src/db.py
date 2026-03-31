from typing import List
import pymysql
from src.models import Message, Profile, Chat

conn = pymysql.connect(
    host="84.38.180.130",
    port=3306,
    user="greg",
    password="Wasthatthebiteof87",
    database="greg_db"
)

#all functions are self-explanatory
def get_users() -> List[Profile]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    return [Profile(**row) for row in cursor]

def my_profile(user_id: int) -> Profile:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    return Profile(**cursor.fetchone())

def get_chats(user_id: int) -> List[Chat]:
    cursor = conn.cursor()
    cursor.execute("SELECT chats.id, chats.name FROM users INNER JOIN u2c ON u2c.uid = (?) INNER JOIN chats ON chats.id = u2c.cid",
        [user_id]
    )
    chats = cursor.fetchall()
    return [Chat(**chat) for chat in chats]

def register_user(user: Profile) -> bool:
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (name, age, email, phone, country) VALUES (?, ?, ?, ?, ?)",
        (user.name, user.age, user.email, user.phone, user.country)
    )
    conn.commit()
    return True

def create_chat(chat: Chat) -> bool:
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chats (name) VALUES (?)",
        (chat.name)
    )
    conn.commit()
    return True

def get_messages(chat_id: int) -> List[Message]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE chat_id = ?",
        (chat_id,)
    )
    messages = cursor.fetchall()
    return [Message(**message) for message in messages]