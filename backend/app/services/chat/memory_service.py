# app/services/chat/memory_service.py
from app.services.chat.history_service import HistoryService
from app.services.workspace_service import get_workspace_summary
from app.ai.router_ai import needs_web_search
from app.services.web_search import search_web


class MemoryService:

    @staticmethod
    def prepare_conversation(chat_id: int):
        conversation = HistoryService.build_conversation(chat_id)
        workspace_summary = get_workspace_summary(chat_id)

        if workspace_summary != "No documents uploaded.":
            conversation.insert(
                0,
                {
                    "role": "system",
                    "content": (
                        "Current Workspace:\n\n"
                        f"{workspace_summary}\n\n"
                        "These documents are available in this chat."
                    )
                }
            )

        latest_query = ""
        for message in reversed(conversation):
            if message["role"] == "user":
                latest_query = message["content"]
                break

        if not latest_query:
            return conversation, None

        should_search = needs_web_search(latest_query)
        if not should_search:
            return conversation, None

        try:
            web_context = search_web(latest_query)
            if web_context and web_context.strip():
                return conversation, web_context
        except Exception as e:
            print(f"SEARCH ERROR: {e}")

        return conversation, None