"""
Web Search Service

Flow:
User Query
    ↓
Cache Check
    ↓
Smart Rewrite Detection
    ↓
AI Query Rewriter (Only if Needed)
    ↓
Tavily Search
    ↓
Context Builder
    ↓
Save Cache
"""

import os

from dotenv import load_dotenv
from tavily import TavilyClient

from app.services.context_builder import build_context
from app.services.query_rewriter import rewrite_query
from app.services.rewrite_detector import needs_rewrite
from app.services.cache_service import (
    get_cached_response,
    save_response,
)

load_dotenv()

client = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)


def search_web(query: str) -> str:
    """
    Performs AI-assisted web search with smart
    query rewriting and caching.
    """

    try:

        # ------------------------------------------------
        # Cache Check
        # ------------------------------------------------

        cached_response = get_cached_response(query)

        if cached_response:
            print("\n" + "=" * 70)
            print("CACHE HIT")
            print("=" * 70)
            return cached_response

        print("\n" + "=" * 70)
        print("CACHE MISS")
        print("=" * 70)

        # ------------------------------------------------
        # Smart Rewrite Detection
        # ------------------------------------------------

        if needs_rewrite(query):

            rewritten_query = rewrite_query(query)

            rewrite_status = "YES"

        else:

            rewritten_query = query

            rewrite_status = "NO"

        # ------------------------------------------------
        # Rewrite Logs
        # ------------------------------------------------

        print("\n" + "=" * 70)
        print("SMART QUERY REWRITER")
        print("=" * 70)
        print(f"Rewrite Required : {rewrite_status}")
        print(f"Original Query   : {query}")
        print(f"Search Query     : {rewritten_query}")
        print("=" * 70)

        # ------------------------------------------------
        # Tavily Search
        # ------------------------------------------------

        result = client.search(
            query=rewritten_query,
            search_depth="advanced",
            max_results=5,
            include_answer=True,
            include_images=False,
            include_raw_content=True,
        )

        # ------------------------------------------------
        # Build Context
        # ------------------------------------------------

        context = build_context(
            query=query,
            result=result,
        )

        # ------------------------------------------------
        # Save Cache
        # ------------------------------------------------

        save_response(query, context)

        print("\n" + "=" * 70)
        print("CACHE SAVED")
        print("=" * 70)

        return context

    except Exception as e:

        print("\n" + "=" * 70)
        print("WEB SEARCH ERROR")
        print("=" * 70)
        print(e)

        return """
Unable to fetch live information.

Answer using your own knowledge and clearly
mention that live search failed.
"""