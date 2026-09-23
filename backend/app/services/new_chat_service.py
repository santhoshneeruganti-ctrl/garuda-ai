from app.database import connection, cursor

def create_new_chat(title: str):
    cursor.execute(
        "INSERT INTO chats(title) VALUES(?)",
        (title,)
    )

    connection.commit()

    chat_id = cursor.lastrowid

    return {
        "status": "success",
        "chat_id": chat_id,
        "title": title
    }