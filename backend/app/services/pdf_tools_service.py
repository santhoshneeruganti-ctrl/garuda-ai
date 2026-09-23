from app.services.pdf_db_service import get_latest_pdf
from app.services.semantic_retriever import semantic_search


class PdfToolsService:

    @staticmethod
    def summarize(chat_id: int):

        """
        Generate summary for the latest PDF.
        """

        latest_pdf = get_latest_pdf(chat_id)

        if not latest_pdf:
            return "No PDF found in this chat."

        pdf_chunks = semantic_search(
            chat_id,
            "Summarize this PDF"
        )

        if not pdf_chunks:
            return "No content found inside the PDF."

        text = []

        for chunk in pdf_chunks:

            if isinstance(chunk, dict):

                chunk_text = chunk.get(
                    "chunk_text",
                    ""
                )

            else:

                chunk_text = str(chunk)

            if chunk_text.strip():

                text.append(chunk_text)

        pdf_content = "\n".join(text)

        prompt = f"""
You are Garuda AI.

Read the following PDF content.

Generate:

1. Short Summary

2. Important Topics

3. Key Concepts

PDF:

{pdf_content}
"""

        # -----------------------------
        # TEMPORARY
        # -----------------------------
        #
        # Next step:
        # Replace this with
        # GroqService.generate(prompt)
        #
        # -----------------------------

        return prompt