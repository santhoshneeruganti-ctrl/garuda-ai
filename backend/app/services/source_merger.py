"""
Source Merger

Combines multiple retrieved web sources into
one clean document for AI Fact Extraction.
"""

import re

MAX_SOURCE_LENGTH = 2000


def clean_text(text: str) -> str:
    """
    Clean unnecessary whitespace and formatting.
    """

    if not text:
        return ""

    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"http\S+", "", text)

    return text.strip()


def merge_sources(results: list) -> str:
    """
    Merge all retrieved sources into
    one structured document.
    """

    merged = []

    for index, source in enumerate(results, start=1):

        title = clean_text(
            source.get("title", "")
        )

        content = (
            source.get("raw_content")
            or source.get("content")
            or ""
        )

        content = clean_text(content)

        if len(content) > MAX_SOURCE_LENGTH:
            content = (
                content[:MAX_SOURCE_LENGTH] + "..."
            )

        merged.append(f"""
==============================
SOURCE {index}

TITLE:
{title}

CONTENT:
{content}
""")

    return "\n".join(merged)