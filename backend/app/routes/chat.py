from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.chat_model import (
    ChatRequest,
    FollowUpRequest,
    EditMessageRequest,
)

from app.services.chat_service import (
    chat,
    stream_chat,
    regenerate_stream,
    edit_and_stream,
    stream_follow_up,
)


router = APIRouter()


# ============================================================
# NORMAL CHAT
# ============================================================

@router.post("/chat")
def chat_api(request: ChatRequest):

    attached_pdf_ids = [
        pdf.id
        for pdf in request.uploaded_pdfs
        if pdf.id
    ]

    attached_image_ids = [
        image.id
        for image in request.uploaded_images
        if image.id
    ]

    return chat(
        request.chat_id,
        request.message,
        attached_pdf_ids=attached_pdf_ids,
        attached_image_ids=attached_image_ids,
        response_style=request.response_style,
    )


# ============================================================
# STREAMING CHAT
# ============================================================

@router.post("/chat/stream")
def stream_chat_api(request: ChatRequest):

    attached_pdf_ids = [
        pdf.id
        for pdf in request.uploaded_pdfs
        if pdf.id
    ]

    attached_image_ids = [
        image.id
        for image in request.uploaded_images
        if image.id
    ]

    return StreamingResponse(
        stream_chat(
            request.chat_id,
            request.message,
            attached_pdf_ids=attached_pdf_ids,
            attached_image_ids=attached_image_ids,
            response_style=request.response_style,
        ),
        media_type="text/plain",
    )


# ============================================================
# FOLLOW-UP
# ============================================================

@router.post("/chat/follow-up")
def follow_up_api(request: FollowUpRequest):

    return StreamingResponse(
        stream_follow_up(
            request.original_question,
            request.original_answer,
            request.mini_conversation,
            request.question,
        ),
        media_type="text/plain",
    )


# ============================================================
# REGENERATE
# ============================================================

@router.post("/chat/regenerate")
def regenerate_api(request: ChatRequest):

    return StreamingResponse(
        regenerate_stream(
            request.chat_id,
            response_style=request.response_style,
        ),
        media_type="text/plain",
    )


# ============================================================
# EDIT MESSAGE
# ============================================================

@router.post("/chat/edit")
def edit_chat_api(request: EditMessageRequest):

    return StreamingResponse(
        edit_and_stream(
            request.chat_id,
            request.message_id,
            request.message,
        ),
        media_type="text/plain",
    )