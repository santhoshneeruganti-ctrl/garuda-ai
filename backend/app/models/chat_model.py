from typing import List, Dict, Any

from pydantic import BaseModel, Field, AliasChoices, ConfigDict


# ============================================================
# PDF ATTACHMENT
# ============================================================

class UploadedPDF(BaseModel):
    """
    Represents a PDF currently attached to the chat.
    """

    id: int
    name: str


# ============================================================
# IMAGE ATTACHMENT
# ============================================================

class UploadedImage(BaseModel):
    """
    Represents an image currently attached to the chat.

    The image is uploaded separately through the image
    upload endpoint. Only its ID and metadata are sent
    with the chat request.
    """

    id: str

    name: str

    # Accept both:
    #
    # mime_type
    # mimeType
    #
    # This keeps the backend compatible with the
    # frontend image object.

    mime_type: str = Field(
        default="",
        validation_alias=AliasChoices(
            "mime_type",
            "mimeType",
        ),
    )


# ============================================================
# CHAT REQUEST
# ============================================================

class ChatRequest(BaseModel):
    """
    Request model used for normal and streaming chat.
    """

    chat_id: int

    message: str

    # --------------------------------------------------------
    # AI RESPONSE STYLE
    # --------------------------------------------------------

    response_style: str = "Balanced"

    # --------------------------------------------------------
    # PDF ATTACHMENTS
    # --------------------------------------------------------

    uploaded_pdfs: List[UploadedPDF] = Field(
        default_factory=list
    )

    # --------------------------------------------------------
    # IMAGE ATTACHMENTS
    # --------------------------------------------------------

    uploaded_images: List[UploadedImage] = Field(
        default_factory=list
    )


# ============================================================
# FOLLOW-UP / MINI CHAT REQUEST
# ============================================================

class FollowUpRequest(BaseModel):
    """
    Request model used by the Mini Question Box.

    This conversation is temporary and is NOT stored
    as a normal chat conversation.
    """

    original_question: str

    original_answer: str

    # Temporary mini-chat conversation.

    mini_conversation: List[
        Dict[str, Any]
    ] = Field(
        default_factory=list
    )

    question: str


# ============================================================
# EDIT MESSAGE REQUEST
# ============================================================

class EditMessageRequest(BaseModel):
    """
    Request model used when editing an existing message.
    """

    chat_id: int

    message_id: int

    message: str