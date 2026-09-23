from typing import List


# ==================================================
# Chunk Grouping
# ==================================================

def group_chunks(
    chunks: List,
    group_size: int = 8
):
    """
    Split a large list of chunks into
    smaller groups.

    Example:

    120 chunks

    →

    15 groups

    →

    Each group contains 8 chunks.
    """

    if not chunks:
        return []

    groups = []

    for index in range(
        0,
        len(chunks),
        group_size
    ):

        groups.append(
            chunks[
                index:index + group_size
            ]
        )

    return groups


# ==================================================
# Merge Chunk Text
# ==================================================

def merge_chunks(
    chunks
):
    """
    Convert a chunk group into
    a single string.
    """

    merged = []

    for chunk in chunks:

        if isinstance(chunk, dict):

            text = chunk.get(
                "chunk_text",
                ""
            )

        else:

            text = str(chunk)

        if text.strip():

            merged.append(
                text.strip()
            )

    return "\n\n".join(
        merged
    )


# ==================================================
# Detect Large PDF
# ==================================================

def is_large_document(
    chunks,
    threshold=25
):
    """
    Returns True if the PDF contains
    many chunks.

    Default:

    >25 chunks

    considered large.
    """

    return len(chunks) > threshold


# ==================================================
# Build Summary Prompt
# ==================================================

def build_summary_prompt(
    text: str
):
    """
    Create a structured summarization prompt.
    """

    return f"""
You are an expert document analyst.

Read the following document carefully.

Produce a well-structured summary.

Requirements:

1. Main purpose

2. Important topics

3. Key findings

4. Important facts

5. Final conclusion

Keep the summary accurate.

DOCUMENT:

{text}
"""