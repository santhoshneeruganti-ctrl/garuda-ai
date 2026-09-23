from app.services.semantic_retriever import get_pdf_filename


class CitationService:

    @staticmethod
    def build_pdf_context(
        pdf_chunks,
        pdf_id
    ):
        """
        Build page-aware PDF context for Garuda.
        """

        if not pdf_chunks or not pdf_id:
            return ""

        pdf_name = get_pdf_filename(pdf_id) or "Unknown PDF"

        formatted_chunks = []

        for chunk in pdf_chunks:

            if isinstance(chunk, dict):
                chunk_text = chunk.get(
                    "chunk_text",
                    ""
                ).strip()

                page_number = chunk.get(
                    "page_number"
                )

            else:

                chunk_text = str(
                    chunk
                ).strip()

                page_number = None

            if not chunk_text:
                continue

            if page_number is not None:

                source_label = (
                    f"[{pdf_name}, Page {page_number}]"
                )

            else:

                source_label = (
                    f"[{pdf_name}]"
                )

            formatted_chunks.append(
                f"{source_label}\n{chunk_text}"
            )

        if not formatted_chunks:
            return ""

        pdf_content = "\n\n".join(
            formatted_chunks
        )

        return f"""
The user has provided a PDF document.

PDF filename: {pdf_name}

Use the PDF content below as the primary source
for answering questions about this document.

IMPORTANT PDF RULES:

1. Answer using the supplied PDF content.

2. Never claim that no PDF was provided when this
   PDF context is available.

3. Do not invent information that is not supported
   by the PDF.

4. If the requested information is not present in
   the supplied PDF content, clearly say so.

5. Cite the supporting PDF page when making factual
   claims from the document.

6. Use citations exactly in this format:

   [{pdf_name}, Page X]

7. Place citations naturally after the statement
   they support.

8. Do not invent page numbers.

9. Only use page numbers shown in the PDF content
   below.

PDF CONTENT:

{pdf_content}
"""

    @staticmethod
    def build_multi_pdf_context(
        pdf_results
    ):

        """
        Build context using multiple PDFs.
        """

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

                    chunk_text = chunk.get(
                        "chunk_text",
                        ""
                    ).strip()

                    page_number = chunk.get(
                        "page_number"
                    )

                else:

                    chunk_text = str(
                        chunk
                    ).strip()

                    page_number = None

                if not chunk_text:
                    continue

                if page_number is not None:

                    source = (
                        f"[{file_name}, Page {page_number}]"
                    )

                else:

                    source = (
                        f"[{file_name}]"
                    )

                formatted_chunks.append(
                    f"{source}\n{chunk_text}"
                )

            if formatted_chunks:

                document_sections.append(
                    f"\nDOCUMENT: {file_name}\n"
                    + "\n".join(
                        formatted_chunks
                    )
                )

        if not document_sections:
            return ""

        combined_documents = "\n\n".join(
            document_sections
        )

        return f"""
The user is asking about one or more PDF documents.

Use ONLY the supplied PDF content.

IMPORTANT RULES:

1. Keep every document separate.

2. Never mix two PDFs.

3. Compare only when asked.

4. Cite every important claim.

5. Citation format:

   [filename.pdf, Page X]

6. Never invent filenames.

7. Never invent page numbers.

8. If information is missing,
   clearly mention it.

PDF DOCUMENTS:

{combined_documents}
"""