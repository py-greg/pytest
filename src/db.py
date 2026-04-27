from typing import List, Optional
import pymysql
from src.models import Message, Profile, Chat, ChatCreate

conn = pymysql.connect(
    host="84.38.180.130",
    port=3306,
    user="greg",
    password="Wasthatthebiteof87",
    database="greg_db",
    cursorclass=pymysql.cursors.DictCursor
)


def ensure_indexes() -> None:
    cursor = conn.cursor()
    statements = [
        "CREATE INDEX idx_messages_chat_timestamp ON messages(chat_id, timestamp)",
        "CREATE INDEX idx_u2c_uid_cid ON u2c(uid, cid)",
        "CREATE INDEX idx_messages_sender_id ON messages(sender_id)",
    ]
    for statement in statements:
        try:
            cursor.execute(statement)
        except Exception:
            # Ignore if index already exists or DB engine does not support this syntax.
            pass
    conn.commit()

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
    cursor.execute(
        "SELECT chats.id, chats.name FROM u2c INNER JOIN chats ON chats.id = u2c.cid WHERE u2c.uid = %s",
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

def create_chat(chat: ChatCreate) -> Chat:
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chats (name) VALUES (%s)",
        (chat.name,)
    )
    chat_id = cursor.lastrowid
    user_ids = chat.user_ids
    if not user_ids:
        cursor.execute("SELECT id FROM users")
        user_ids = [user["id"] for user in cursor.fetchall()]
    for user_id in user_ids:
        cursor.execute("INSERT INTO u2c (uid, cid) VALUES (%s, %s)", (user_id, chat_id))
    conn.commit()
    return Chat(id=chat_id, name=chat.name)

def get_messages(chat_id: int, limit: int = 100, before_id: Optional[int] = None) -> List[Message]:
    cursor = conn.cursor()
    query = (
        "SELECT messages.*, users.name AS sender_name "
        "FROM messages "
        "LEFT JOIN users ON users.id = messages.sender_id "
        "WHERE messages.chat_id = %s "
    )
    params = [chat_id]
    if before_id is not None:
        query += "AND messages.id < %s "
        params.append(before_id)
    query += "ORDER BY messages.timestamp DESC, messages.id DESC LIMIT %s"
    params.append(limit)
    cursor.execute(
        query,
        tuple(params),
    )
    rows = list(reversed(cursor.fetchall()))
    messages = [
        Message(
            id=row["id"],
            chat_id=row["chat_id"],
            sender_id=row["sender_id"],
            sender_name=row.get("sender_name") or "",
            receiver_id=row.get("receiver_id"),
            text=row.get("message") or "",
            created_at=str(row.get("timestamp") or ""),
        )
        for row in rows
    ]
    return messages

def save_message(
    chat_id: int,
    sender_id: int,
    text: str,
    receiver_id: int = None,
    sender_name: str = "",
) -> Message:
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (chat_id, sender_id, receiver_id, message, timestamp) VALUES (%s, %s, %s, %s, NOW())",
        (chat_id, sender_id, receiver_id, text),
    )
    message_id = cursor.lastrowid
    if not sender_name:
        cursor.execute("SELECT name FROM users WHERE id = %s", (sender_id,))
        sender_row = cursor.fetchone()
        sender_name = (sender_row or {}).get("name", "")
    conn.commit()
    return Message(
        id=message_id,
        chat_id=chat_id,
        sender_id=sender_id,
        sender_name=sender_name,
        receiver_id=receiver_id,
        text=text,
        created_at="",
    )

def get_user_chat_ids(user_id: int) -> List[int]:
    cursor = conn.cursor()
    cursor.execute("SELECT cid FROM u2c WHERE uid = %s", (user_id,))
    return [row["cid"] for row in cursor.fetchall()]

def user_in_chat(user_id: int, chat_id: int) -> bool:
    cursor = conn.cursor()
    cursor.execute(
        "SELECT 1 FROM u2c WHERE uid = %s AND cid = %s LIMIT 1",
        (user_id, chat_id),
    )
    return cursor.fetchone() is not None


def get_user_name(user_id: int) -> str:
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    return (row or {}).get("name", "")