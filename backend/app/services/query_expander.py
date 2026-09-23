from typing import Dict

QUERY_HINTS: Dict[str, list[str]] = {
    "ai": [
        "OpenAI",
        "Google Gemini",
        "Anthropic",
        "Microsoft Copilot",
    ],
    "news": [
        "today",
        "latest",
        "breaking",
    ],
    "price": [
        "today",
        "current",
        "live",
    ],
    "weather": [
        "today",
        "forecast",
    ],
    "movie": [
        "review",
        "cast",
        "release date",
    ],
    "award": [
        "winners",
        "results",
    ],
    "ipl": [
        "points table",
        "latest match",
    ],
    "python": [
        "documentation",
        "tutorial",
    ],
    "fastapi": [
        "documentation",
        "examples",
    ],
}


def expand_query(query: str) -> str:
    """
    Expands a user query into ONE richer search query.
    """

    expanded_terms = []

    lower = query.lower()

    for keyword, terms in QUERY_HINTS.items():
        if keyword in lower:
            expanded_terms.extend(terms)

    expanded_terms = list(dict.fromkeys(expanded_terms))

    if expanded_terms:
        return query + " " + " ".join(expanded_terms)

    return query