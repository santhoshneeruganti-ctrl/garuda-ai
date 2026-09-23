from app.database.database import cursor
from app.models.forgot_password_model import ForgotPasswordRequest

from app.auth.otp_handler import generate_otp
from app.auth.mail_sender import send_otp
from app.auth.otp_storage import otp_storage


def forgot_password(user: ForgotPasswordRequest):

    cursor.execute(
        """
        SELECT email
        FROM users
        WHERE email = ?
        """,
        (user.email,)
    )

    data = cursor.fetchone()

    if data is None:
        return {
            "status": "failed",
            "message": "Email Not Found"
        }

    otp = generate_otp()

    otp_storage[user.email] = otp

    send_otp(
        user.email,
        otp
    )

    return {
        "status": "success",
        "message": "OTP Sent Successfully"
    }