"""
Search Pipeline

Coordinates the complete AI Search workflow.
"""

from app.services.query_rewriter import rewrite_query
from app.services.intent_classifier import classify_intent
from app.services.source_ranker import rank_sources
from app.services.retriever import retrieve_best_sources
from app.services.source_merger import merge_sources
from app.services.fact_extractor import extract_facts


def process_search_result(query: str, tavily_result: dict) -> str:
    """
    Process Tavily search results into
    clean AI-ready facts.
    """

    # -----------------------------
    # Intent Detection
    # -----------------------------
    intent = classify_intent(query)

    # -----------------------------
    # Rank Sources
    # -----------------------------
    ranked = rank_sources(
        tavily_result.get("results", []),
        intent,
    )

    # -----------------------------
    # Retrieve Best Sources
    # -----------------------------
    retrieved = retrieve_best_sources(ranked)

    # -----------------------------
    # Merge Sources
    # -----------------------------
    merged_document = merge_sources(retrieved)

    # -----------------------------
    # AI Fact Extraction
    # -----------------------------
    facts = extract_facts(merged_document)

    return facts