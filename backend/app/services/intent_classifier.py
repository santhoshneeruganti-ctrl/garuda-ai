"""
Intent Classifier

This module detects the intent of the user's query.

Supported Intents:
- NEWS
- PROGRAMMING
- SPORTS
- FINANCE
- EDUCATION
- MOVIES
- HEALTH
- TECHNOLOGY
- GENERAL
"""

from enum import Enum
from typing import Dict, List


class SearchIntent(str, Enum):
    NEWS = "news"
    PROGRAMMING = "programming"
    SPORTS = "sports"
    FINANCE = "finance"
    EDUCATION = "education"
    MOVIES = "movies"
    HEALTH = "health"
    TECHNOLOGY = "technology"
    GENERAL = "general"


INTENT_KEYWORDS: Dict[SearchIntent, List[str]] = {

    SearchIntent.NEWS: [
        "news",
        "latest",
        "today",
        "breaking",
        "update",
        "announcement",
        "current affairs",
    ],

    SearchIntent.PROGRAMMING: [
        "python",
        "java",
        "c++",
        "c",
        "javascript",
        "typescript",
        "react",
        "angular",
        "vue",
        "fastapi",
        "django",
        "flask",
        "spring",
        "spring boot",
        "node",
        "nodejs",
        "express",
        "html",
        "css",
        "sql",
        "mysql",
        "mongodb",
        "postgresql",
        "api",
        "bug",
        "error",
        "exception",
        "debug",
        "algorithm",
        "dsa",
        "leetcode",
        "code",
        "program",
        "coding",
    ],

    SearchIntent.SPORTS: [
        "ipl",
        "cricket",
        "football",
        "soccer",
        "nba",
        "fifa",
        "tennis",
        "wimbledon",
        "olympics",
        "match",
        "score",
        "player",
        "points table",
    ],

    SearchIntent.FINANCE: [
        "gold",
        "silver",
        "bitcoin",
        "crypto",
        "stock",
        "share",
        "market",
        "sensex",
        "nifty",
        "price",
        "investment",
    ],

    SearchIntent.EDUCATION: [
        "eapcet",
        "eamcet",
        "jee",
        "neet",
        "gate",
        "upsc",
        "college",
        "admission",
        "counselling",
        "counseling",
        "exam",
        "results",
        "syllabus",
        "university",
    ],

    SearchIntent.MOVIES: [
        "movie",
        "film",
        "actor",
        "actress",
        "director",
        "box office",
        "ott",
        "trailer",
        "award",
        "national award",
        "oscar",
    ],

    SearchIntent.HEALTH: [
        "doctor",
        "hospital",
        "medicine",
        "disease",
        "symptoms",
        "treatment",
        "health",
        "covid",
        "fever",
    ],

    SearchIntent.TECHNOLOGY: [
        "ai",
        "artificial intelligence",
        "chatgpt",
        "gemini",
        "claude",
        "openai",
        "google",
        "microsoft",
        "apple",
        "nvidia",
        "technology",
    ]
}


def classify_intent(query: str) -> SearchIntent:
    """
    Detect the user's search intent.
    """

    query = query.lower()

    scores = {}

    for intent, keywords in INTENT_KEYWORDS.items():

        score = 0

        for keyword in keywords:

            if keyword in query:
                score += 1

        scores[intent] = score

    best_intent = max(scores, key=scores.get)

    if scores[best_intent] == 0:
        return SearchIntent.GENERAL

    return best_intent


# ---------------------------------------------------------
# Local Testing
# ---------------------------------------------------------
if __name__ == "__main__":

    tests = [

        "Latest AI News",
        "FastAPI tutorial",
        "AP EAPCET counselling dates",
        "Gold price today",
        "Who won IPL yesterday?",
        "National Film Awards 2026",
        "Symptoms of dengue fever",
        "What is Python?",
        "Current Bitcoin price",
        "Top engineering colleges in AP",

    ]

    for q in tests:
        print(f"{q}")
        print(f"Intent : {classify_intent(q)}")
        print("-" * 60)