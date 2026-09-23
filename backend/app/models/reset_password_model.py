from pydantic import BaseModel


class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str