"""
Conversation Memory

Stores recent conversation messages
for contextual AI responses.
"""

from collections import deque

# Maximum number of messages to remember
MAX_HISTORY = 10

# In-memory conversation history
_history = deque(maxlen=MAX_HISTORY)


def save_message(role: str, content: str):
    """
    Save a conversation message.
    """

    _history.append({
        "role": role,
        "content": content.strip()
    })


def get_recent_messages():
    """
    Returns recent conversation.
    """

    return list(_history)


def build_chat_history() -> str:
    """
    Convert conversation into prompt text.
    """

    if not _history:
        return ""

    lines = []

    lines.append("RECENT CONVERSATION")
    lines.append("=" * 50)

    for message in _history:

        role = message["role"].upper()

        lines.append(f"{role}:")
        lines.append(message["content"])
        lines.append("")

    lines.append("=" * 50)

    return "\n".join(lines)


def clear_history():
    """
    Clear conversation history.
    """

    _history.clear()


def history_size():
    """
    Number of stored messages.
    """

    return len(_history)