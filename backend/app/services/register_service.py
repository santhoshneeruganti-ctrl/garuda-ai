import bcrypt
from sqlite3 import IntegrityError

from app.database.database import connection, cursor
from app.models.register_model import RegisterRequest


def register(user: RegisterRequest):

    try:

        # =====================================================
        # CHECK USERNAME
        # =====================================================

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE username=?
            """,
            (user.username,)
        )

        existing_username = cursor.fetchone()

        if existing_username:

            return {
                "status": "failed",
                "message": "Username already exists"
            }


        # =====================================================
        # CHECK EMAIL
        # =====================================================

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE email=?
            """,
            (user.email,)
        )

        existing_email = cursor.fetchone()

        if existing_email:

            return {
                "status": "failed",
                "message": "Email already exists"
            }


        # =====================================================
        # ENCRYPT PASSWORD
        # =====================================================

        hashed_password = bcrypt.hashpw(
            user.password.encode("utf-8"),
            bcrypt.gensalt()
        )


        # =====================================================
        # INSERT USER
        # =====================================================

        cursor.execute(
            """
            INSERT INTO users(
                username,
                email,
                password
            )
            VALUES (?, ?, ?)
            """,
            (
                user.username,
                user.email,
                hashed_password.decode("utf-8")
            )
        )


        # =====================================================
        # SAVE DATABASE
        # =====================================================

        connection.commit()


        return {
            "status": "success",
            "message": "User Registered Successfully"
        }


    # =========================================================
    # DATABASE INTEGRITY ERROR
    # =========================================================

    except IntegrityError:

        connection.rollback()

        return {
            "status": "failed",
            "message": "Username or Email already exists"
        }


    # =========================================================
    # OTHER ERRORS
    # =========================================================

    except Exception as e:

        connection.rollback()

        return {
            "status": "failed",
            "message": str(e)
        }