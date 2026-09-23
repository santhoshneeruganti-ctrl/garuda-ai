"""
Rewrite Detector

Determines whether a query needs
AI-powered rewriting.
"""

RECENT_KEYWORDS = {
    "latest",
    "today",
    "current",
    "breaking",
    "news",
    "recent",
    "update",
    "updates",
    "live",
    "now",
    "this week",
    "this month",
    "2026",
}


def needs_rewrite(query: str) -> bool:
    """
    Returns True if the query
    should be rewritten.
    """

    text = query.lower()

    for keyword in RECENT_KEYWORDS:
        if keyword in text:
            return True

    return False