from fastapi import APIRouter

from app.models.new_chat_model import NewChatRequest
from app.services.new_chat_service import create_new_chat

router = APIRouter()


@router.post("/new-chat")
def new_chat_api(request: NewChatRequest):
    return create_new_chat(request.title)