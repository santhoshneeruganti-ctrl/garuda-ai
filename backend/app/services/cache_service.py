"""
Simple In-Memory Cache Service
"""

import time

# Cache storage
_cache = {}

# Cache expiry time (5 minutes)
CACHE_EXPIRY = 300


def get_cached_response(query: str):
    """
    Returns cached response if available and not expired.
    """

    key = query.lower().strip()

    if key not in _cache:
        return None

    data = _cache[key]

    age = time.time() - data["timestamp"]

    if age > CACHE_EXPIRY:
        del _cache[key]
        return None

    return data["response"]


def save_response(query: str, response: str):
    """
    Save response in cache.
    """

    key = query.lower().strip()

    _cache[key] = {
        "response": response,
        "timestamp": time.time()
    }


def clear_cache():
    """
    Clear all cached data.
    """

    _cache.clear()


def cache_size():
    """
    Number of cached items.
    """

    return len(_cache)