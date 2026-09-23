"""
Source Ranker

Ranks Tavily search results based on
1. Website Trust Score
2. Search Intent

Higher score = Higher Priority
"""

from urllib.parse import urlparse
from typing import Dict, List

from app.services.intent_classifier import SearchIntent

# ----------------------------------------------------------
# Base Domain Scores
# ----------------------------------------------------------

BASE_SCORES: Dict[str, int] = {

    # Government
    "gov.in": 100,
    "nic.in": 100,

    # Official Documentation
    "fastapi.tiangolo.com": 98,
    "python.org": 98,
    "developer.mozilla.org": 98,
    "learn.microsoft.com": 98,
    "docs.oracle.com": 98,
    "react.dev": 98,

    # AI Companies
    "openai.com": 97,
    "anthropic.com": 97,
    "ai.google.dev": 97,
    "deepmind.google": 97,

    # Tech
    "github.com": 95,
    "stackoverflow.com": 92,

    # News
    "reuters.com": 96,
    "bbc.com": 95,
    "thehindu.com": 92,
    "indianexpress.com": 92,
    "hindustantimes.com": 90,

    # Education
    "apsche.ap.gov.in": 99,
    "nta.ac.in": 99,

    # Knowledge
    "wikipedia.org": 80,

    # Blogs
    "medium.com": 65,
    "geeksforgeeks.org": 90,
}

# ----------------------------------------------------------
# Intent Boosts
# ----------------------------------------------------------

INTENT_BOOSTS = {

    SearchIntent.PROGRAMMING: {
        "fastapi.tiangolo.com": 15,
        "python.org": 15,
        "developer.mozilla.org": 15,
        "github.com": 10,
        "stackoverflow.com": 10,
        "geeksforgeeks.org": 5,
    },

    SearchIntent.NEWS: {
        "reuters.com": 15,
        "bbc.com": 15,
        "thehindu.com": 10,
        "indianexpress.com": 10,
    },

    SearchIntent.EDUCATION: {
        "gov.in": 15,
        "nic.in": 15,
        "apsche.ap.gov.in": 20,
        "nta.ac.in": 20,
    },

    SearchIntent.FINANCE: {
        "reuters.com": 10,
        "bbc.com": 10,
    },

    SearchIntent.TECHNOLOGY: {
        "openai.com": 15,
        "anthropic.com": 15,
        "github.com": 10,
    }
}


# ----------------------------------------------------------
# Extract Domain
# ----------------------------------------------------------

def extract_domain(url: str) -> str:

    try:

        domain = urlparse(url).netloc.lower()

        if domain.startswith("www."):
            domain = domain[4:]

        return domain

    except Exception:

        return ""


# ----------------------------------------------------------
# Calculate Score
# ----------------------------------------------------------

def get_domain_score(
    url: str,
    intent: SearchIntent = SearchIntent.GENERAL,
) -> int:

    domain = extract_domain(url)

    score = 50

    # Base Score
    for trusted_domain, base_score in BASE_SCORES.items():

        if trusted_domain in domain:
            score = base_score
            break

    # Intent Boost
    boosts = INTENT_BOOSTS.get(intent, {})

    for trusted_domain, boost in boosts.items():

        if trusted_domain in domain:
            score += boost
            break

    return score


# ----------------------------------------------------------
# Rank Sources
# ----------------------------------------------------------

def rank_sources(
    results: List[dict],
    intent: SearchIntent = SearchIntent.GENERAL,
) -> List[dict]:

    ranked = sorted(

        results,

        key=lambda item: get_domain_score(

            item.get("url", ""),
            intent,

        ),

        reverse=True,

    )

    return ranked


# ----------------------------------------------------------
# Testing
# ----------------------------------------------------------

if __name__ == "__main__":

    sample = [

        {
            "title": "Medium",
            "url": "https://medium.com/article"
        },

        {
            "title": "FastAPI",
            "url": "https://fastapi.tiangolo.com/tutorial"
        },

        {
            "title": "GitHub",
            "url": "https://github.com/tiangolo/fastapi"
        },

        {
            "title": "Reuters",
            "url": "https://www.reuters.com/world"
        }

    ]

    ranked = rank_sources(
        sample,
        SearchIntent.PROGRAMMING
    )

    print()

    for item in ranked:

        print(
            get_domain_score(
                item["url"],
                SearchIntent.PROGRAMMING
            ),
            item["title"]
        )