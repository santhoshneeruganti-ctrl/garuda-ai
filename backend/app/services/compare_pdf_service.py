from app.services.semantic_retriever import (
    semantic_search_by_pdf_id,
    get_pdf_filename,
)


def get_compare_context(
    pdf1_id: int,
    pdf2_id: int,
    query: str
):
    """
    Strictly builds comparison context from the two explicitly selected PDFs.
    Never leaks or falls back to unrelated database documents.
    """
    name1 = get_pdf_filename(pdf1_id) or f"Document {pdf1_id}"
    name2 = get_pdf_filename(pdf2_id) or f"Document {pdf2_id}"

    chunks1 = semantic_search_by_pdf_id(pdf1_id, query, limit=4)
    chunks2 = semantic_search_by_pdf_id(pdf2_id, query, limit=4)

    context_lines = [
        "### STRICT MULTI-DOCUMENT COMPARISON CONTEXT",
        f"Comparing Document 1: {name1}",
        f"Comparing Document 2: {name2}\n",
    ]

    if chunks1:
        context_lines.append(f"=== CONTENT FROM {name1} ===")
        for c in chunks1:
            context_lines.append(f"[Source: {name1}]\n{c}\n")
    else:
        context_lines.append(f"=== {name1} ===\n(No digital text extracted. Document may be a scanned or handwritten image.)\n")

    if chunks2:
        context_lines.append(f"=== CONTENT FROM {name2} ===")
        for c in chunks2:
            context_lines.append(f"[Source: {name2}]\n{c}\n")
    else:
        context_lines.append(f"=== {name2} ===\n(No digital text extracted. Document may be a scanned or handwritten image.)\n")

    context_lines.append(
        "RULES FOR COMPARISON:\n"
        "1. Compare ONLY the two documents above.\n"
        "2. If one of the documents has handwritten/scanned pages with no digital text, explicitly notify the user about it.\n"
        "3. Do NOT mention any other document from past chats.\n"
    )

    return "\n".join(context_lines)