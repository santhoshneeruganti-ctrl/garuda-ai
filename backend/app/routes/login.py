from fastapi import APIRouter
from app.models.login_model import LoginRequest
from app.services import login_service

router = APIRouter()

@router.post("/login")
def login(user: LoginRequest):
    return login_service.login(user)