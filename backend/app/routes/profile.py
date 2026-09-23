from fastapi import APIRouter, Header

from app.auth.jwt_handler import verify_access_token
from app.database.database import cursor


router = APIRouter()


@router.get("/profile")
def get_profile(
    authorization: str = Header(default=None)
):

    # ======================================================
    # AUTHORIZATION CHECK
    # ======================================================

    if authorization is None:

        return {
            "status": "failed",
            "message": "Authorization Header Missing"
        }


    if not authorization.startswith("Bearer "):

        return {
            "status": "failed",
            "message": "Invalid Authorization Format"
        }


    # ======================================================
    # EXTRACT TOKEN
    # ======================================================

    token = authorization.replace(
        "Bearer ",
        "",
        1
    )


    # ======================================================
    # VERIFY TOKEN
    # ======================================================

    username = verify_access_token(
        token
    )


    if username is None:

        return {
            "status": "failed",
            "message": "Invalid or Expired Token"
        }


    # ======================================================
    # GET USER FROM DATABASE
    # ======================================================

    cursor.execute(
        """
        SELECT
            id,
            username,
            email
        FROM users
        WHERE username = ?
        """,
        (username,)
    )


    user = cursor.fetchone()


    if user is None:

        return {
            "status": "failed",
            "message": "User Not Found"
        }


    # ======================================================
    # PROFILE RESPONSE
    # ======================================================

    return {

        "status":
            "success",

        "message":
            "Profile Retrieved Successfully",

        "id":
            user["id"],

        "username":
            user["username"],

        "email":
            user["email"],

    }