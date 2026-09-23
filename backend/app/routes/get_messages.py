from fastapi import APIRouter

from app.services.get_messages_service import get_chat_messages

router = APIRouter()


@router.get("/chat/{chat_id}")
def load_chat_api(chat_id: int):
    return get_chat_messages(chat_id)