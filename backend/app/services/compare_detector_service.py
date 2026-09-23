from app.services.workspace_service import get_chat_documents


def normalize(text: str) -> str:
    """
    Converts:
    Java_Dynamic.pdf
    ->
    java dynamic
    """

    text = text.lower()

    text = text.replace(".pdf", "")
    text = text.replace("_", " ")
    text = text.replace("-", " ")

    return " ".join(text.split())


def detect_compare_documents(
    chat_id: int,
    query: str
):
    """
    Detects which two uploaded PDFs are mentioned
    in the user's compare request.
    """

    query = normalize(query)

    documents = get_chat_documents(chat_id)

    matched = []

    for doc in documents:

        file_name = normalize(doc["file_name"])

        if file_name in query:
            matched.append(doc)

    if len(matched) >= 2:
        return (
            matched[0],
            matched[1]
        )

    return (
        None,
        None
    )