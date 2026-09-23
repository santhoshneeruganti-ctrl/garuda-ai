from fastapi import APIRouter

from app.services.delete_chat_service import delete_chat

router = APIRouter()

@router.delete("/chat/{chat_id}")
def remove_chat(chat_id: int):

    return delete_chat(chat_id)