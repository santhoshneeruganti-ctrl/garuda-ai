from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from starlette.background import BackgroundTask

import pyttsx3
import tempfile
import os


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


class TTSRequest(BaseModel):
    text: str


def delete_file(path: str):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception:
        pass


@router.post("/speak")
async def speak_text(request: TTSRequest):

    temp_path = None

    try:

        text = request.text.strip()

        if not text:
            raise HTTPException(
                status_code=400,
                detail="No text received."
            )

        print(
            f"🔊 TTS request received: {len(text)} characters"
        )

        # ==================================================
        # CREATE TEMP WAV FILE
        # ==================================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav"
        ) as temp_file:

            temp_path = temp_file.name

        # ==================================================
        # PYTTSX3
        # ==================================================

        engine = pyttsx3.init()

        engine.setProperty(
            "rate",
            170
        )

        engine.setProperty(
            "volume",
            1.0
        )

        engine.save_to_file(
            text,
            temp_path
        )

        engine.runAndWait()

        engine.stop()

        # ==================================================
        # VERIFY AUDIO
        # ==================================================

        if not os.path.exists(temp_path):

            raise HTTPException(
                status_code=500,
                detail="TTS audio was not generated."
            )

        file_size = os.path.getsize(
            temp_path
        )

        print(
            f"🔊 TTS audio generated: {file_size} bytes"
        )

        if file_size == 0:

            raise HTTPException(
                status_code=500,
                detail="Generated TTS audio is empty."
            )

        # ==================================================
        # RETURN AUDIO
        # ==================================================

        return FileResponse(
            temp_path,
            media_type="audio/wav",
            filename="garuda_voice.wav",
            background=BackgroundTask(
                delete_file,
                temp_path
            )
        )

    except HTTPException:
        raise

    except Exception as error:

        print(
            "❌ TTS error:",
            repr(error)
        )

        if temp_path:
            delete_file(temp_path)

        raise HTTPException(
            status_code=500,
            detail="Text-to-speech failed."
        )