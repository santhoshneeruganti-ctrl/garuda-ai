# app/services/chat/pdf_chat.py
from app.database import get_cursor
from app.services.semantic_retriever import (
    semantic_search,
    semantic_search_by_pdf_id,
    get_latest_pdf_id,
    get_pdf_filename,
    find_pdf_by_filename,
    resolve_pdfs_from_query,
)


class PdfChatService:

    @staticmethod
    def build_ambiguous_pdf_message(ambiguous_pdfs):
        if not ambiguous_pdfs:
            return ""

        lines = ["I found multiple PDF documents that match your request.\n"]
        for ambiguity in ambiguous_pdfs:
            matches = ambiguity.get("matches", [])
            if not matches:
                continue
            lines.append("Please choose one of these PDFs:")
            for index, pdf in enumerate(matches, start=1):
                lines.append(f"{index}. {pdf['file_name']}")

        lines.append("\nReply with the exact PDF name.")
        return "\n".join(lines)

    @staticmethod
    def build_pdf_context(pdf_chunks, pdf_id):
        if not pdf_chunks or not pdf_id:
            return ""

        pdf_name = get_pdf_filename(pdf_id) or "Unknown PDF"
        formatted_chunks = []

        for chunk in pdf_chunks:
            if isinstance(chunk, dict):
                chunk_text = chunk.get("chunk_text", "").strip()
                page_number = chunk.get("page_number")
            else:
                chunk_text = str(chunk).strip()
                page_number = None

            if not chunk_text:
                continue

            source_label = f"[{pdf_name}, Page {page_number}]" if page_number is not None else f"[{pdf_name}]"
            formatted_chunks.append(f"{source_label}\n{chunk_text}")

        if not formatted_chunks:
            return ""

        pdf_content = "\n\n".join(formatted_chunks)
        return f"""
The user has provided a PDF document.

PDF filename: {pdf_name}

Use the PDF content below as the primary source for answering questions about this document.

IMPORTANT PDF RULES:
1. Answer using the supplied PDF content.
2. Never claim that no PDF was provided when this PDF context is available.
3. Do not invent information that is not supported by the PDF.
4. Cite the supporting PDF page when making factual claims.

PDF CONTENT:
{pdf_content}
"""

    @staticmethod
    def build_multi_pdf_context(pdf_results):
        if not pdf_results:
            return ""

        document_sections = []
        for pdf in pdf_results:
            file_name = pdf["file_name"]
            chunks = pdf["chunks"]
            if not chunks:
                continue

            formatted_chunks = []
            for chunk in chunks:
                if isinstance(chunk, dict):
                    chunk_text = chunk.get("chunk_text", "").strip()
                    page_number = chunk.get("page_number")
                else:
                    chunk_text = str(chunk).strip()
                    page_number = None

                if not chunk_text:
                    continue

                source = f"[{file_name}, Page {page_number}]" if page_number else f"[{file_name}]"
                formatted_chunks.append(f"{source}\n{chunk_text}")

            if formatted_chunks:
                document_sections.append(f"DOCUMENT: {file_name}\n" + "\n".join(formatted_chunks))

        if not document_sections:
            return ""

        combined_documents = "\n\n".join(document_sections)
        return f"""
The user is asking about one or more PDF documents.
Use ONLY the supplied PDF content when answering questions about these documents.

PDF DOCUMENTS:
{combined_documents}
"""

    @staticmethod
    def is_pdf_reference(message: str) -> bool:
        text = message.lower().strip()
        pdf_words = [
            "pdf", "document", "file", "previous pdf", "previous document",
            "uploaded pdf", "uploaded document", "that pdf", "this pdf"
        ]
        return any(word in text for word in pdf_words)

    @staticmethod
    def get_pdf_context(chat_id: int, message: str, latest_pdf=None, attached_pdf_ids=None):
        pdf_chunks = []
        used_pdf_id = None

        pdf_resolution = resolve_pdfs_from_query(chat_id, message)
        mentioned_pdfs = pdf_resolution["matched"]
        ambiguous_pdfs = pdf_resolution["ambiguous"]

        if ambiguous_pdfs:
            clarification_message = PdfChatService.build_ambiguous_pdf_message(ambiguous_pdfs)
            return "__PDF_CLARIFICATION__" + clarification_message, [], None

        if len(mentioned_pdfs) > 1:
            pdf_results = []
            for pdf in mentioned_pdfs:
                pdf_id = pdf["id"]
                chunks = semantic_search_by_pdf_id(pdf_id, message)
                pdf_results.append({"pdf_id": pdf_id, "file_name": pdf["file_name"], "chunks": chunks})
            return PdfChatService.build_multi_pdf_context(pdf_results), [], None

        mentioned_pdf = None
        cursor = get_cursor()
        try:
            cursor.execute("SELECT file_name FROM pdfs WHERE chat_id = ? ORDER BY id DESC", (chat_id,))
            pdf_rows = cursor.fetchall()
        finally:
            cursor.close()

        message_lower = message.lower()
        for row in pdf_rows:
            file_name = row["file_name"]
            full_name = file_name.lower()
            base_name = full_name[:-4] if full_name.endswith(".pdf") else full_name
            if full_name in message_lower or base_name in message_lower:
                mentioned_pdf = find_pdf_by_filename(chat_id, file_name)
                if mentioned_pdf:
                    break

        if mentioned_pdf:
            used_pdf_id = mentioned_pdf["id"]
            pdf_chunks = semantic_search_by_pdf_id(used_pdf_id, message)
        elif latest_pdf:
            used_pdf_id = latest_pdf["id"]
            pdf_chunks = semantic_search(chat_id, message)
        elif PdfChatService.is_pdf_reference(message):
            previous_pdf_id = get_latest_pdf_id(chat_id)
            if previous_pdf_id:
                used_pdf_id = previous_pdf_id
                pdf_chunks = semantic_search_by_pdf_id(previous_pdf_id, message)
        else:
            cursor = get_cursor()
            try:
                cursor.execute(
                    "SELECT pdf_id FROM messages WHERE chat_id = ? AND sender = 'user' AND pdf_id IS NOT NULL ORDER BY id DESC LIMIT 1",
                    (chat_id,)
                )
                previous_pdf = cursor.fetchone()
            finally:
                cursor.close()

            if previous_pdf:
                used_pdf_id = previous_pdf["pdf_id"]
                pdf_chunks = semantic_search_by_pdf_id(used_pdf_id, message)

        pdf_context = PdfChatService.build_pdf_context(pdf_chunks, used_pdf_id)
        return pdf_context, pdf_chunks, used_pdf_id