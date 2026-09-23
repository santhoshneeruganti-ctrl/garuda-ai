import re

# Strict web search keywords (removed broad terms to prevent unnecessary slow API calls)
WEB_KEYWORDS = {
    # Time / Live
    "live score",
    "breaking news",
    
    # Weather
    "weather today",
    "weather forecast",
    "current temperature",
    "earthquake today",
    "cyclone update",

    # Finance / Crypto (specific live markers)
    "live bitcoin price",
    "crypto market today",
    "sensex today",
    "nifty today",
    "stock price today",
    "exchange rate today",

    # Sports Scores
    "live match score",
    "ipl score",
    "world cup score",
    "football score today",

    # Awards & Government Results (current year markers)
    "national awards 2026",
    "oscars 2026",
    "election results 2026",
    "exam results 2026",
    "admit card 2026",
    "cutoff 2026"
}


def _contains_keyword(text: str) -> bool:
    text = text.lower()
    for keyword in WEB_KEYWORDS:
        if keyword in text:
            return True
    return False


def needs_web_search(question: str) -> bool:
    question = re.sub(r"\s+", " ", question).strip().lower()

    # Automatically bypass web search for coding, logic, and local PDF tasks to ensure instant speed
    coding_triggers = ["def ", "class ", "import ", "code", "java", "python", "react", "fastapi", "sql", "error", "fix", "explain", "compare"]
    if any(trigger in question for trigger in coding_triggers) and not any(time_word in question for time_word in ["today", "2026", "live"]):
        return False

    decision = _contains_keyword(question)

    print("=" * 60)
    print("ROUTER AI (OPTIMIZED)")
    print("=" * 60)
    print("Question :", question)
    print("Needs Web Search :", decision)
    print("=" * 60)

    return decision