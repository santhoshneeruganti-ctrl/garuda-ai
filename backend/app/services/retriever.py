def retrieve_best_sources(results: list, max_sources: int = 3) -> list:
    """
    Select the most relevant search results.

    Currently returns the top N results.
    Future versions can use semantic similarity.
    """

    if not results:
        return []

    return results[:max_sources]