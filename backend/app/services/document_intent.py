from enum import StrEnum


# ======================================================
# Document Intents
# ======================================================

class DocumentIntent(StrEnum):

    UNKNOWN = "unknown"

    SUMMARY = "summary"

    EXPLAIN = "explain"

    SEARCH = "search"

    COMPARE = "compare"

    TRANSLATE = "translate"

    NOTES = "notes"

    QUIZ = "quiz"

    FLASHCARDS = "flashcards"

    TIMELINE = "timeline"

    FAQ = "faq"

    EXTRACT = "extract"

    ACTION_ITEMS = "action_items"

    LIST_DOCUMENTS = "list_documents"

    OPEN_DOCUMENT = "open_document"

    DELETE_DOCUMENT = "delete_document"

    SEARCH_ALL = "search_all"

    COMPARE_DOCUMENTS = "compare_documents"


# ==================================================
# Detect Intent
# ==================================================

def detect_document_intent(
    query: str
) -> DocumentIntent:

    query = query.lower()

    # Summary
    if any(word in query for word in [
        "summary",
        "summarize",
        "summarise",
        "overview"
    ]):
        return DocumentIntent.SUMMARY

    # Compare (Added typos like comapre to prevent matching issues)
    if any(word in query for word in [
        "compare",
        "comapre",
        "cmpare",
        "difference",
        "differences"
    ]):
        return DocumentIntent.COMPARE_DOCUMENTS

    # Notes
    if "notes" in query:
        return DocumentIntent.NOTES

    # Quiz
    if "quiz" in query:
        return DocumentIntent.QUIZ

    # Flashcards
    if "flashcard" in query:
        return DocumentIntent.FLASHCARDS

    # Translate
    if "translate" in query:
        return DocumentIntent.TRANSLATE

    # List Documents
    if any(word in query for word in [
        "list documents",
        "my documents",
        "uploaded documents"
    ]):
        return DocumentIntent.LIST_DOCUMENTS

    return DocumentIntent.UNKNOWN