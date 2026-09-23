from fastapi import APIRouter

from app.models.verify_otp_model import VerifyOtpRequest
from app.services import verify_otp_service

router = APIRouter()


@router.post("/verify-otp")
def verify_otp(user: VerifyOtpRequest):
    return verify_otp_service.verify_otp(user)