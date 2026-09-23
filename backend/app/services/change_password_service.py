import bcrypt

from app.database.database import connection, cursor
from app.models.change_password_model import ChangePasswordRequest


def change_password(
    username: str,
    user: ChangePasswordRequest
):

    # ======================================================
    # VALIDATE NEW PASSWORD
    # ======================================================

    if not user.new_password:

        return {
            "status": "failed",
            "message": "New password cannot be empty"
        }


    # ======================================================
    # CHECK PASSWORD CONFIRMATION
    # ======================================================

    if (
        user.new_password
        != user.confirm_password
    ):

        return {
            "status": "failed",
            "message": "New passwords do not match"
        }


    # ======================================================
    # BASIC PASSWORD LENGTH
    # ======================================================

    if len(user.new_password) < 8:

        return {
            "status": "failed",
            "message": "New password must be at least 8 characters"
        }


    # ======================================================
    # GET CURRENT USER
    # ======================================================

    cursor.execute(
        """
        SELECT password
        FROM users
        WHERE username = ?
        """,
        (username,)
    )


    result = cursor.fetchone()


    if result is None:

        return {
            "status": "failed",
            "message": "User not found"
        }


    # ======================================================
    # STORED PASSWORD
    # ======================================================

    stored_password = result["password"]


    # ======================================================
    # VERIFY CURRENT PASSWORD
    # ======================================================

    try:

        password_matches = bcrypt.checkpw(
            user.current_password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

    except Exception:

        password_matches = False


    if not password_matches:

        return {
            "status": "failed",
            "message": "Current password is incorrect"
        }


    # ======================================================
    # PREVENT SAME PASSWORD
    # ======================================================

    if bcrypt.checkpw(
        user.new_password.encode("utf-8"),
        stored_password.encode("utf-8")
    ):

        return {
            "status": "failed",
            "message": "New password must be different from current password"
        }


    # ======================================================
    # HASH NEW PASSWORD
    # ======================================================

    hashed_password = bcrypt.hashpw(
        user.new_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


    # ======================================================
    # UPDATE DATABASE
    # ======================================================

    try:

        cursor.execute(
            """
            UPDATE users
            SET password = ?
            WHERE username = ?
            """,
            (
                hashed_password,
                username
            )
        )


        connection.commit()


    except Exception as error:

        connection.rollback()

        print(
            "❌ Change Password Database Error:",
            error
        )

        return {
            "status": "failed",
            "message": "Unable to update password"
        }


    # ======================================================
    # SUCCESS
    # ======================================================

    return {
        "status": "success",
        "message": "Password Changed Successfully"
    }