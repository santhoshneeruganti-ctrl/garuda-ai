from app.database import connection, get_cursor


def get_all_chats():
    cursor = get_cursor()

    try:
        cursor.execute("""
            SELECT id, title, created_at
            FROM chats
            ORDER BY created_at DESC
        """)

        chats = cursor.fetchall()

        data = []

        for chat in chats:
            data.append({
                "id": chat["id"],
                "title": chat["title"],
                "created_at": chat["created_at"]
            })

        return {
            "status": "success",
            "chats": data
        }

    finally:
        cursor.close()