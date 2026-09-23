from fastapi import APIRouter, Header

from app.auth.jwt_handler import verify_access_token
from app.services.home_service import get_user_details

router = APIRouter()


@router.get("/home")
def home(authorization: str = Header(None)):

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

    token = authorization.split(" ", 1)[1]

    username = verify_access_token(token)

    if username is None:
        return {
            "status": "failed",
            "message": "Invalid or Expired Token"
        }

    user = get_user_details(username)

    if user is None:
        return {
            "status": "failed",
            "message": "User Not Found"
        }

    return {
        "status": "success",
        "message": "Welcome to Garuda",
        "username": user["username"]
    }