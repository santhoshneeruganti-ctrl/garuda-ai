from pydantic import BaseModel


class HomeResponse(BaseModel):
    status: str
    message: str
    username: str