from fastapi import APIRouter
from app.services.get_chats_service import get_all_chats

router = APIRouter()

@router.get("/chats")
def chats():
    return get_all_chats()