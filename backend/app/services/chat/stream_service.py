from typing import Generator

from app.ai.ai_handler import ask_garuda
from app.database import connection, get_cursor
from app.services.pdf_db_service import get_latest_pdf
from app.services.chat.memory_service import MemoryService
from app.services.chat.pdf_chat import PdfChatService
from app.services.document_command_service import execute_document_command
from app.services.compare_detector_service import detect_compare_documents
from app.services.compare_pdf_service import get_compare_context
from app.services.document_intent import detect_document_intent, DocumentIntent
from app.services.semantic_retriever import semantic_search_by_pdf_id


class StreamService:

    @staticmethod
    def stream_chat(
        chat_id: int,
        message: str,
        attached_pdf_ids=None
    ) -> Generator[str, None, None]:

        latest_pdf = get_latest_pdf(chat_id)
        pdf_id = latest_pdf["id"] if latest_pdf else None

        cursor = get_cursor()
        try:
            cursor.execute(
                """
                INSERT INTO messages(chat_id, sender, message, pdf_id)
                VALUES(?, ?, ?, ?)
                """,
                (chat_id, "user", message, pdf_id)
            )
            connection.commit()
        finally:
            cursor.close()

        # ==================================================
        # Document Commands Execution
        # ==================================================
        document_response = execute_document_command(chat_id, message)

        if document_response:
            yield document_response
            cursor = get_cursor()
            try:
                cursor.execute(
                    """
                    INSERT INTO messages(chat_id, sender, message)
                    VALUES(?, ?, ?)
                    """,
                    (chat_id, "garuda", document_response)
                )
                connection.commit()
            finally:
                cursor.close()
            return

        conversation, web_context = MemoryService.prepare_conversation(chat_id)

        # ==================================================
        # PDF Context Processing
        # ==================================================
        pdf_context = ""
        pdf_chunks = []
        used_pdf_id = None

        if PdfChatService.is_pdf_reference(message):
            print("📄 PDF Question Detected")
            pdf_context, pdf_chunks, used_pdf_id = PdfChatService.get_pdf_context(
                chat_id,
                message,
                latest_pdf,
                attached_pdf_ids,
            )
        else:
            print("💬 General Question")

        # ==================================================
        # Compare Documents Context Processing
        # ==================================================
        compare_context = None
        document_intent = detect_document_intent(message)

        if document_intent == DocumentIntent.COMPARE_DOCUMENTS:
            pdf1, pdf2 = detect_compare_documents(chat_id, message)
            if pdf1 and pdf2:
                compare_context = get_compare_context(pdf1["id"], pdf2["id"], message)

        print("\n" + "=" * 60)
        print("PDF DEBUG")
        print("=" * 60)
        print("CHAT ID:", chat_id)
        print("LATEST PDF:", latest_pdf)
        print("PDF ID:", used_pdf_id)
        print("PDF CHUNKS COUNT:", len(pdf_chunks))

        if pdf_chunks or pdf_context:
            print("✅ PDF CONTEXT RETRIEVED")
        else:
            print("❌ NO PDF CHUNKS RETRIEVED")
        print("=" * 60)

        messages = conversation.copy()

        if pdf_context:
            messages.insert(0, {"role": "system", "content": pdf_context})

        if compare_context:
            messages.insert(0, {"role": "system", "content": compare_context})

        print("=" * 60)
        print("STREAM MODE")
        print(f"WEB CONTEXT EXISTS: {web_context is not None}")
        print("=" * 60)

        stream = ask_garuda(
            messages,
            web_context=web_context,
            stream=True
        )

        full_reply = ""

        for chunk in stream:
            if not chunk.choices:
                continue

            delta = chunk.choices[0].delta
            if delta is None:
                continue

            token = delta.content
            if token:
                full_reply += token
                yield token

        cursor = get_cursor()
        try:
            cursor.execute(
                """
                INSERT INTO messages(chat_id, sender, message)
                VALUES(?, ?, ?)
                """,
                (chat_id, "garuda", full_reply)
            )
            connection.commit()
        finally:
            cursor.close()

    @staticmethod
    def regenerate_stream(chat_id: int) -> Generator[str, None, None]:
        cursor = get_cursor()
        try:
            cursor.execute(
                """
                DELETE FROM messages
                WHERE id=(
                    SELECT id
                    FROM messages
                    WHERE chat_id=?
                    AND sender='garuda'
                    ORDER BY id DESC
                    LIMIT 1
                )
                """,
                (chat_id,)
            )
            connection.commit()
        finally:
            cursor.close()

        conversation, web_context = MemoryService.prepare_conversation(chat_id)

        cursor = get_cursor()
        try:
            cursor.execute(
                """
                SELECT message, pdf_id
                FROM messages
                WHERE chat_id = ?
                  AND sender = 'user'
                ORDER BY id DESC
                LIMIT 1
                """,
                (chat_id,)
            )
            latest_user_row = cursor.fetchone()
        finally:
            cursor.close()

        latest_user_message = ""
        attached_pdf_id = None

        if latest_user_row:
            latest_user_message = latest_user_row["message"]
            attached_pdf_id = latest_user_row["pdf_id"]

        pdf_chunks = []
        if attached_pdf_id:
            pdf_chunks = semantic_search_by_pdf_id(attached_pdf_id, latest_user_message)

        pdf_context = PdfChatService.build_pdf_context(pdf_chunks, attached_pdf_id)

        print("=" * 60)
        print("REGENERATE STREAM MODE")
        print(f"WEB CONTEXT EXISTS: {web_context is not None}")
        print("=" * 60)

        messages = conversation.copy()

        if pdf_context:
            messages.insert(0, {"role": "system", "content": pdf_context})

        stream = ask_garuda(
            messages,
            web_context=web_context,
            stream=True
        )

        full_reply = ""

        for chunk in stream:
            if not chunk.choices:
                continue

            delta = chunk.choices[0].delta
            if delta is None:
                continue

            token = delta.content
            if token:
                full_reply += token
                yield token

        cursor = get_cursor()
        try:
            cursor.execute(
                """
                INSERT INTO messages(chat_id, sender, message)
                VALUES(?, ?, ?)
                """,
                (chat_id, "garuda", full_reply)
            )
            connection.commit()
        finally:
            cursor.close()

    @staticmethod
    def edit_and_stream(
        chat_id: int,
        message_id: int,
        message: str
    ) -> Generator[str, None, None]:

        cursor = get_cursor()
        try:
            cursor.execute(
                """
                SELECT pdf_id
                FROM messages
                WHERE id = ?
                  AND chat_id = ?
                  AND sender = 'user'
                """,
                (message_id, chat_id)
            )

            original_message = cursor.fetchone()
            attached_pdf_id = original_message["pdf_id"] if original_message else None

            cursor.execute(
                """
                UPDATE messages
                SET message = ?
                WHERE id = ?
                  AND chat_id = ?
                  AND sender = 'user'
                """,
                (message, message_id, chat_id)
            )

            cursor.execute(
                """
                DELETE FROM messages
                WHERE chat_id = ?
                  AND id > ?
                """,
                (chat_id, message_id)
            )

            connection.commit()
        finally:
            cursor.close()

        conversation, web_context = MemoryService.prepare_conversation(chat_id)

        pdf_chunks = []
        if attached_pdf_id:
            pdf_chunks = semantic_search_by_pdf_id(attached_pdf_id, message)

        pdf_context = PdfChatService.build_pdf_context(pdf_chunks, attached_pdf_id)

        print("=" * 60)
        print("EDIT AND STREAM MODE")
        print(f"WEB CONTEXT EXISTS: {web_context is not None}")
        print("=" * 60)

        messages = conversation.copy()

        if pdf_context:
            messages.insert(0, {"role": "system", "content": pdf_context})

        stream = ask_garuda(
            messages,
            web_context=web_context,
            stream=True
        )

        full_reply = ""

        for chunk in stream:
            if not chunk.choices:
                continue

            delta = chunk.choices[0].delta
            if delta is None:
                continue

            token = delta.content
            if token:
                full_reply += token
                yield token

        cursor = get_cursor()
        try:
            cursor.execute(
                """
                INSERT INTO messages(chat_id, sender, message)
                VALUES(?, ?, ?)
                """,
                (chat_id, "garuda", full_reply)
            )
            connection.commit()
        finally:
            cursor.close()