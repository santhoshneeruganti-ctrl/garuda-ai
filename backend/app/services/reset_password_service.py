import bcrypt

from app.database.database import connection, cursor
from app.models.reset_password_model import ResetPasswordRequest
from app.auth.otp_storage import otp_storage, verified_users


def reset_password(user: ResetPasswordRequest):

    if user.email not in verified_users:
        return {
            "status": "failed",
            "message": "Please Verify OTP First"
        }

    hashed_password = bcrypt.hashpw(
        user.new_password.encode(),
        bcrypt.gensalt()
    ).decode()

    cursor.execute(
        """
        UPDATE users
        SET password = ?
        WHERE email = ?
        """,
        (
            hashed_password,
            user.email
        )
    )

    connection.commit()

    verified_users.remove(user.email)

    if user.email in otp_storage:
        del otp_storage[user.email]

    return {
        "status": "success",
        "message": "Password Reset Successfully"
    }