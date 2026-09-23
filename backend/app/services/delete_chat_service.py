from app.database import connection, cursor

def delete_chat(chat_id: int):

    cursor.execute("""
        DELETE FROM messages
        WHERE chat_id = ?
    """, (chat_id,))

    cursor.execute("""
        DELETE FROM chats
        WHERE id = ?
    """, (chat_id,))

    connection.commit()

    return {
        "status": "success",
        "message": "Chat deleted successfully"
    }