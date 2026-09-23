import bcrypt

from app.auth.jwt_handler import create_access_token
from app.database.database import cursor
from app.models.login_model import LoginRequest


def login(user: LoginRequest):

    cursor.execute(
        "SELECT * FROM users WHERE username=?",
        (user.username,)
    )

    result = cursor.fetchone()

    if result is None:
        return {
            "status": "failed",
            "message": "Invalid Username or Password"
        }

    # Password is in 4th column
    stored_password = result[3]

    if bcrypt.checkpw(
        user.password.encode("utf-8"),
        stored_password.encode("utf-8")
    ):

        token = create_access_token(
            {
                "sub": user.username
            }
        )

        return {
            "status": "success",
            "message": "Login Successful",
            "access_token": token,
            "token_type": "bearer"
        }

    return {
        "status": "failed",
        "message": "Invalid Username or Password"
    }