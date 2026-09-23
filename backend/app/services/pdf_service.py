import pymupdf


def extract_text(pdf_path: str):
    """
    Extract PDF text page by page.

    Returns:
    [
        {
            "page_number": 1,
            "text": "..."
        },
        ...
    ]
    """

    document = pymupdf.open(pdf_path)

    pages = []

    try:
        for page_index, page in enumerate(document):

            text = page.get_text("text").strip()

            # Ignore completely empty pages
            if not text:
                continue

            pages.append(
                {
                    "page_number": page_index + 1,
                    "text": text,
                }
            )

    finally:
        document.close()

    return pages