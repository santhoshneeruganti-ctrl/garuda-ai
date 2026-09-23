from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse

import uuid
from pathlib import Path


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/image",
    tags=["Image Intelligence"],
)


# ============================================================
# IMAGE STORAGE
# ============================================================

# backend/uploads/images
BASE_DIR = Path(__file__).resolve().parents[2]

IMAGE_DIR = BASE_DIR / "uploads" / "images"

IMAGE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# VALIDATION
# ============================================================

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024


# ============================================================
# IMAGE UPLOAD
# ============================================================

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    chat_id: int = Form(...),
):

    # --------------------------------------------------------
    # BASIC FILE CHECK
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No image file selected.",
        )


    # --------------------------------------------------------
    # MIME TYPE
    # --------------------------------------------------------

    content_type = (
        file.content_type or ""
    ).lower().strip()


    # --------------------------------------------------------
    # EXTENSION
    # --------------------------------------------------------

    original_extension = (
        Path(file.filename)
        .suffix
        .lower()
    )


    # --------------------------------------------------------
    # VALIDATE TYPE
    # --------------------------------------------------------

    if (
        content_type not in ALLOWED_TYPES
        and original_extension not in ALLOWED_EXTENSIONS
    ):

        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are supported.",
        )


    # --------------------------------------------------------
    # READ IMAGE
    # --------------------------------------------------------

    image_bytes = await file.read()


    if not image_bytes:

        raise HTTPException(
            status_code=400,
            detail="Image file is empty.",
        )


    # --------------------------------------------------------
    # SIZE VALIDATION
    # --------------------------------------------------------

    if len(image_bytes) > MAX_IMAGE_SIZE:

        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 10 MB.",
        )


    # --------------------------------------------------------
    # DETERMINE SAFE EXTENSION
    # --------------------------------------------------------

    if content_type in ALLOWED_TYPES:

        extension = ALLOWED_TYPES[
            content_type
        ]

    else:

        if original_extension == ".jpeg":
            extension = ".jpg"
        else:
            extension = original_extension


    # --------------------------------------------------------
    # UNIQUE IMAGE ID
    # --------------------------------------------------------

    image_id = str(
        uuid.uuid4()
    )

    filename = (
        f"{image_id}{extension}"
    )

    file_path = (
        IMAGE_DIR / filename
    )


    # --------------------------------------------------------
    # SAVE IMAGE
    # --------------------------------------------------------

    try:

        with open(
            file_path,
            "wb",
        ) as output:

            output.write(
                image_bytes
            )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save image: {error}",
        )


    print(
        f"🖼️ Image uploaded successfully: {filename}"
    )


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "status": "success",

        "success": True,

        "image_id": image_id,

        "file_name": file.filename,

        "mime_type": content_type,

        "path": str(file_path),

        "chat_id": chat_id,

        "url": f"/image/view/{image_id}",

    }


# ============================================================
# VIEW IMAGE
# ============================================================

@router.get("/view/{image_id}")
async def view_image(
    image_id: str,
):

    # --------------------------------------------------------
    # VALIDATE UUID
    # --------------------------------------------------------

    try:

        parsed_id = uuid.UUID(
            image_id
        )

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="Invalid image ID.",
        )


    # --------------------------------------------------------
    # FIND IMAGE
    # --------------------------------------------------------

    image_path = None

    for extension in [
        ".jpg",
        ".png",
        ".webp",
    ]:

        candidate = (
            IMAGE_DIR
            / f"{parsed_id}{extension}"
        )

        if candidate.is_file():

            image_path = candidate
            break


    if image_path is None:

        raise HTTPException(
            status_code=404,
            detail="Image not found.",
        )


    # --------------------------------------------------------
    # MIME TYPE
    # --------------------------------------------------------

    mime_type = {
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }.get(
        image_path.suffix.lower(),
        "application/octet-stream",
    )


    # --------------------------------------------------------
    # RETURN IMAGE
    # --------------------------------------------------------

    return FileResponse(
        path=image_path,
        media_type=mime_type,
        filename=image_path.name,
    )