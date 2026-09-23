"""
Context Builder

Converts Tavily search results into a clean,
LLM-friendly context.
"""

import re

from app.services.intent_classifier import classify_intent
from app.services.source_ranker import rank_sources
from app.services.retriever import retrieve_best_sources
from app.services.citation_builder import build_citations

MAX_CONTENT_LENGTH = 1500


def clean_content(content: str) -> str:
    """
    Clean unwanted text from article content.
    """

    if not content:
        return ""

    content = re.sub(r"\s+", " ", content)
    content = re.sub(r"_Image.*?_", "", content)
    content = re.sub(r"http\S+", "", content)
    content = re.sub(r"\[.*?\]", "", content)

    return content.strip()


def build_context(query: str, result: dict) -> str:
    """
    Build a structured context for the LLM.
    """

    # -----------------------------------------
    # Detect Intent
    # -----------------------------------------

    intent = classify_intent(query)

    # -----------------------------------------
    # Rank Sources
    # -----------------------------------------

    results = rank_sources(
        result.get("results", []),
        intent,
    )

    # -----------------------------------------
    # Retrieve Best Sources
    # -----------------------------------------

    results = retrieve_best_sources(results)

    # -----------------------------------------
    # Build Context
    # -----------------------------------------

    lines = []
    seen_titles = set()

    lines.append("LIVE VERIFIED WEB RESULTS")
    lines.append("=" * 60)

    answer = result.get("answer", "")

    if answer:
        lines.append("SUMMARY")
        lines.append(answer)
        lines.append("")

    for index, item in enumerate(results, start=1):

        title = item.get("title", "").strip()
        normalized = title.lower()

        if normalized in seen_titles:
            continue

        seen_titles.add(normalized)

        content = clean_content(
            item.get("content", "")
        )

        if len(content) > MAX_CONTENT_LENGTH:
            content = content[:MAX_CONTENT_LENGTH] + "..."

        url = item.get("url", "").strip()

        lines.append(f"Source {index}")

        if title:
            lines.append(f"Title : {title}")

        if content:
            lines.append(content)

        if url:
            lines.append(f"URL : {url}")

        lines.append("")

    lines.append("=" * 60)

    lines.append(
        """
Instructions:

1. Use only verified information.
2. Combine all sources.
3. Remove duplicate facts.
4. Use headings.
5. Use bullet points.
6. Use tables whenever useful.
7. Never guess.
8. Mention uncertainty if information is unavailable.
9. If multiple sources agree, prefer the common information.
10. If sources disagree, mention the conflict instead of guessing.
"""
    )

    # -----------------------------------------
    # Add Citations
    # -----------------------------------------

    citations = build_citations(results)

    if citations:
        lines.append("")
        lines.append(citations)

    return "\n".join(lines)