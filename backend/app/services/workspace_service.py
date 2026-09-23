from app.database import get_cursor


# ==================================================
# Get All Documents
# ==================================================

def get_chat_documents(chat_id: int):
    """
    Returns all uploaded documents for a chat.
    """

    cursor = get_cursor()

    try:

        cursor.execute(
            """
           SELECT
    MIN(id) AS id,
    file_name,
    MAX(uploaded_at) AS uploaded_at
FROM pdfs
WHERE chat_id = ?
GROUP BY file_name
ORDER BY uploaded_at DESC
            """,
            (chat_id,)
        )

        return cursor.fetchall()

    finally:

        cursor.close()


# ==================================================
# Get Document Names
# ==================================================

def get_document_names(chat_id: int):
    """
    Returns only document names.

    Example:
    [
        "Director.pdf",
        "Java.pdf"
    ]
    """

    rows = get_chat_documents(chat_id)

    return [
        row["file_name"]
        for row in rows
    ]


# ==================================================
# Workspace Summary
# ==================================================

def get_workspace_summary(chat_id: int):
    """
    Returns a readable list of uploaded documents.
    """

    documents = get_document_names(chat_id)

    if not documents:
        return "No documents uploaded."

    summary = "Documents in this chat:\n\n"

    for index, document in enumerate(documents, start=1):
        summary += f"{index}. {document}\n"

    return summary


# ==================================================
# Check Document Exists
# ==================================================

def document_exists(
    chat_id: int,
    file_name: str
):
    """
    Returns True if the document exists.
    """

    documents = get_document_names(chat_id)

    file_name = file_name.lower().strip()

    for document in documents:

        if document.lower().strip() == file_name:

            return True

    return False


# ==================================================
# Get Document Count
# ==================================================

def get_document_count(chat_id: int):
    """
    Returns total number of uploaded documents.
    """

    return len(
        get_chat_documents(chat_id)
    )