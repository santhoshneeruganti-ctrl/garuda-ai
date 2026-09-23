from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.pdf_tools_service import PdfToolsService

router = APIRouter(
    prefix="/pdf-tools",
    tags=["PDF Tools"]
)


class SummarizeRequest(BaseModel):
    chat_id: int


@router.post("/summarize")
async def summarize_pdf(request: SummarizeRequest):
    """
    Generate AI summary for the latest PDF
    uploaded in the given chat.
    """

    try:

        summary = PdfToolsService.summarize(
            chat_id=request.chat_id
        )

        return {
            "status": "success",
            "summary": summary
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )