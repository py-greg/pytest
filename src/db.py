from typing import List
import pymysql
from src.models import Message, Profile, Chat

conn = pymysql.connect(
    host="84.38.180.130",
    port=3306,
    user="greg",
    password="Wasthatthebiteof87",
    database="greg_db",
    cursorclass=pymysql.cursors.DictCursor
)

#all functions are self-explanatory
def get_users() -> List[Profile]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    return [Profile(**row) for row in cursor.fetchall()]

def my_profile(user_id: int) -> Profile:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    return Profile(**cursor.fetchall()[0])

def get_chats(user_id: int) -> List[Chat]:
    cursor = conn.cursor()
    cursor.execute("SELECT chats.id, chats.name FROM users INNER JOIN u2c ON u2c.uid = %s INNER JOIN chats ON chats.id = u2c.cid",
        (user_id,)
    )
    return [Chat(**chat) for chat in cursor.fetchall()]

def register_user(user: Profile) -> bool:
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (name, age, email, phone, country) VALUES (%s, %s, %s, %s, %s)",
        (user.name, user.age, user.email, user.phone, user.country,)
    )
    conn.commit()
    return True

def create_chat(chat: Chat) -> bool:
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chats (name) VALUES (%s)",
        (chat.name,)
    )
    conn.commit()
    return True

def get_messages(chat_id: int) -> List[Message]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE chat_id = %s",
        (chat_id,)
    )
    return [Message(**message) for message in cursor.fetchall()]