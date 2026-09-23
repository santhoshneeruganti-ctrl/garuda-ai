from typing import List, Dict, Any


def chunk_text(
    pages: List[Dict[str, Any]],
    chunk_size: int = 500,
    overlap: int = 100
) -> List[Dict[str, Any]]:
    """
    Split page-wise PDF text into chunks while
    preserving the original page number.

    Input:
    [
        {
            "page_number": 1,
            "text": "Page 1 content..."
        },
        {
            "page_number": 2,
            "text": "Page 2 content..."
        }
    ]

    Output:
    [
        {
            "page_number": 1,
            "chunk_text": "..."
        },
        {
            "page_number": 2,
            "chunk_text": "..."
        }
    ]
    """

    chunks = []

    # Safety check
    if not pages:
        return chunks

    # Prevent invalid overlap settings
    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than 0"
        )

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError(
            "overlap must be >= 0 and smaller than chunk_size"
        )

    # ==========================================
    # Process every PDF page separately
    # ==========================================

    for page in pages:

        page_number = page.get(
            "page_number"
        )

        text = page.get(
            "text",
            ""
        ).strip()

        if not text:
            continue

        start = 0

        while start < len(text):

            end = start + chunk_size

            chunk = text[
                start:end
            ].strip()

            if chunk:

                chunks.append(
                    {
                        "page_number": page_number,
                        "chunk_text": chunk,
                    }
                )

            # Stop if we already reached
            # the end of the page
            if end >= len(text):
                break

            start += (
                chunk_size - overlap
            )

    return chunks