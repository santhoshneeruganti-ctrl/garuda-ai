# app/services/chat/history_service.py
from app.database import get_cursor


class HistoryService:

    @staticmethod
    def build_conversation(chat_id: int):
        cursor = get_cursor()
        try:
            cursor.execute(
                """
                SELECT sender, message
                FROM messages
                WHERE chat_id=?
                ORDER BY id DESC
                LIMIT 8
                """,
                (chat_id,)
            )

            rows = cursor.fetchall()
            rows.reverse()

            conversation = []
            for sender, text in rows:
                role = "user" if sender == "user" else "assistant"
                conversation.append({"role": role, "content": text})

            return conversation
        finally:
            cursor.close()