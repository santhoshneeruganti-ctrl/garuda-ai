from fastapi import APIRouter, Header

from app.auth.jwt_handler import verify_access_token

from app.models.change_password_model import (
    ChangePasswordRequest
)

from app.services import change_password_service


router = APIRouter()


@router.post("/change-password")
def change_password(
    user: ChangePasswordRequest,
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
    # CHANGE PASSWORD
    # ======================================================

    return change_password_service.change_password(
        username,
        user
    )