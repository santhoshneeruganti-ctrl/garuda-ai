from fastapi import APIRouter

from app.models.reset_password_model import ResetPasswordRequest
from app.services import reset_password_service

router = APIRouter()


@router.post("/reset-password")
def reset_password(user: ResetPasswordRequest):
    return reset_password_service.reset_password(user)