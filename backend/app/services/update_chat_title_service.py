from app.database import connection, cursor

def update_chat_title(chat_id: int, title: str):

    cursor.execute("""
        UPDATE chats
        SET title = ?
        WHERE id = ?
    """, (title, chat_id))

    connection.commit()

    return {
        "status": "success",
        "message": "Chat title updated successfully"
    }