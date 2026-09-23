from fastapi import APIRouter
from pydantic import BaseModel

from app.services.update_chat_title_service import update_chat_title

router = APIRouter()

class ChatTitle(BaseModel):
    title: str

@router.put("/chat/{chat_id}/title")
def update_title(chat_id: int, data: ChatTitle):

    return update_chat_title(chat_id, data.title)