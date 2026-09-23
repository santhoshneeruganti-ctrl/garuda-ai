from fastapi import APIRouter
from app.models.register_model import RegisterRequest
from app.services import register_service

router = APIRouter()


@router.post("/register")
def register(user: RegisterRequest):
    return register_service.register(user)