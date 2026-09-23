from fastapi import APIRouter

from app.models.forgot_password_model import ForgotPasswordRequest
from app.services import forgot_password_service

router = APIRouter()


@router.post("/forgot-password")
def forgot_password(user: ForgotPasswordRequest):
    return forgot_password_service.forgot_password(user)