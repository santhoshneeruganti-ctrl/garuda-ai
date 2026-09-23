import re

WEB_KEYWORDS = {
    "latest", "today", "current", "live", "recent", "new", "breaking",
    "update", "updates", "news", "headline", "announcement",
    "weather", "forecast", "temperature", "rain", "humidity", "storm",
    "cyclone", "earthquake",
    "gold", "silver", "bitcoin", "crypto", "stock", "stocks", "share",
    "sensex", "nifty", "market", "exchange rate", "currency", "price",
    "score", "scores", "match", "ipl", "world cup", "football",
    "cricket", "nba", "fifa", "tennis",
    "award", "awards", "winner", "winners", "national award",
    "national awards", "oscar", "oscars", "grammy", "filmfare",
    "openai", "chatgpt", "gpt", "gemini", "claude",
    "wwdc", "google io", "apple event",
    "election", "elections", "result", "results",
    "notification", "notifications", "admit card",
    "cutoff", "rank list", "recruitment",
    "traffic", "flight", "train"
}


def _contains_keyword(text: str) -> bool:
    text = text.lower()
    return any(keyword in text for keyword in WEB_KEYWORDS)


def needs_web_search(question: str) -> bool:
    question = re.sub(r"\s+", " ", question).strip().lower()

    decision = _contains_keyword(question)

    print("=" * 60)
    print("ROUTER AI")
    print("=" * 60)
    print("Question :", question)
    print("Needs Web Search :", decision)
    print("=" * 60)

    return decision