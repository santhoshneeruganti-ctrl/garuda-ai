from app.services.document_intent import (
    DocumentIntent,
    detect_document_intent
)

from app.services.workspace_service import (
    get_workspace_summary
)


def execute_document_command(
    chat_id: int,
    message: str
):
    """
    Executes workspace/document commands.

    Returns:
        str -> response
        None -> no command detected
    """

    intent = detect_document_intent(message)

    if intent == DocumentIntent.LIST_DOCUMENTS:
        return get_workspace_summary(chat_id)

    return None