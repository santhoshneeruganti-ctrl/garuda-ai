from typing import List


# ==================================================
# Check Large PDF
# ==================================================

def is_large_pdf(
    chunks: List,
    threshold: int = 25
):
    """
    Returns True if the PDF contains
    many chunks.

    Small PDF:
        <=25 chunks

    Large PDF:
        >25 chunks
    """

    return len(chunks) > threshold


# ==================================================
# Split PDF Into Groups
# ==================================================

def group_pdf_chunks(
    chunks: List,
    group_size: int = 8
):
    """
    Example

    40 chunks

    ↓

    [
        chunk1..8,
        chunk9..16,
        ...
    ]
    """

    groups = []

    for i in range(
        0,
        len(chunks),
        group_size
    ):

        groups.append(
            chunks[
                i:i + group_size
            ]
        )

    return groups


# ==================================================
# Merge Chunk Text
# ==================================================

def merge_chunks(
    chunks: List
):
    """
    Convert multiple chunks into
    one text block.
    """

    text = []

    for chunk in chunks:

        if isinstance(
            chunk,
            dict
        ):

            chunk_text = chunk.get(
                "chunk_text",
                ""
            )

        else:

            chunk_text = str(chunk)

        if chunk_text.strip():

            text.append(
                chunk_text.strip()
            )

    return "\n\n".join(text)


# ==================================================
# Build Summary Prompt
# ==================================================

def build_summary_prompt(
    document_text: str
):
    """
    Prompt for summarizing
    a document.
    """

    return f"""
You are Garuda AI.

Read the following document carefully.

Generate a structured summary.

Your response must contain:

1. Overview

2. Main Topics

3. Important Points

4. Key Facts

5. Final Conclusion

Keep the summary concise,
accurate and well structured.

DOCUMENT

{document_text}
"""