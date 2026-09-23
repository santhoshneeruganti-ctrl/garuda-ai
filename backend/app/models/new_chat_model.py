from pydantic import BaseModel

class NewChatRequest(BaseModel):
    title: str = "New Chat"