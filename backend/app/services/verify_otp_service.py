from app.models.verify_otp_model import VerifyOtpRequest
from app.services.forgot_password_service import otp_storage
from app.services.reset_password_service import verified_users


def verify_otp(user: VerifyOtpRequest):

    if user.email not in otp_storage:
        return {
            "status": "failed",
            "message": "OTP Not Found"
        }

    if otp_storage[user.email] != user.otp:
        return {
            "status": "failed",
            "message": "Invalid OTP"
        }

    verified_users.add(user.email)

    return {
        "status": "success",
        "message": "OTP Verified Successfully"
    }