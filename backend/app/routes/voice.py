from fastapi import APIRouter, UploadFile, File, HTTPException

import os
import tempfile


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


# ============================================================
# WHISPER CONFIGURATION
# ============================================================

# Default is OFF.
#
# Why?
# Render free/512 MB RAM instances should not load the
# Whisper model during FastAPI startup.
#
# To enable Whisper later:
#
# GARUDA_ENABLE_WHISPER=true
#
ENABLE_WHISPER = (
    os.getenv("GARUDA_ENABLE_WHISPER", "false").lower()
    == "true"
)


# ============================================================
# WHISPER MODEL
# ============================================================

model = None


def get_whisper_model():
    """
    Load Whisper only when explicitly enabled.

    This prevents the Whisper model from consuming RAM
    during normal FastAPI startup.
    """

    global model

    if not ENABLE_WHISPER:
        return None

    if model is not None:
        return model

    try:
        print("🦅 Loading Garuda Whisper model...")

        from faster_whisper import WhisperModel

        model = WhisperModel(
            "base.en",
            device="cpu",
            compute_type="int8",
        )

        print("✅ Garuda Whisper model loaded successfully")

        return model

    except Exception as error:

        print(
            "❌ Failed to load Whisper model:",
            error
        )

        return None


# ============================================================
# TRANSCRIBE VOICE
# ============================================================

@router.post("/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...)
):

    # ========================================================
    # WHISPER CHECK
    # ========================================================

    whisper_model = get_whisper_model()

    if whisper_model is None:

        raise HTTPException(
            status_code=503,
            detail=(
                "Server-side voice transcription is currently "
                "disabled. Use client-side voice recognition "
                "or enable GARUDA_ENABLE_WHISPER."
            ),
        )

    temp_path = None

    try:

        # ====================================================
        # VALIDATE FILE
        # ====================================================

        if not audio:

            raise HTTPException(
                status_code=400,
                detail="No audio file received.",
            )

        # ====================================================
        # READ AUDIO
        # ====================================================

        content = await audio.read()

        if not content:

            raise HTTPException(
                status_code=400,
                detail="Empty audio file received.",
            )

        print(
            f"🎤 Voice received: {len(content)} bytes"
        )

        # ====================================================
        # CREATE TEMP FILE
        # ====================================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".webm",
        ) as temp_file:

            temp_path = temp_file.name

            temp_file.write(content)

        # ====================================================
        # TRANSCRIBE
        # ====================================================

        segments, info = whisper_model.transcribe(

            temp_path,

            language="en",

            beam_size=5,

            best_of=5,

            temperature=0.0,

            condition_on_previous_text=False,

            vad_filter=True,

            vad_parameters={
                "min_silence_duration_ms": 500,
                "speech_pad_ms": 250,
                "min_speech_duration_ms": 200,
            },

            initial_prompt=(

                "Garuda voice assistant commands. "

                "Open YouTube. "
                "Open Google. "
                "Open Gmail. "
                "Open GitHub. "
                "Open ChatGPT. "
                "Open WhatsApp. "
                "Open Wikipedia. "

                "Search YouTube. "
                "Search Google. "

                "Volume up. "
                "Volume down. "

                "Mute. "
                "Unmute. "

                "Open Calculator. "
                "Open Notepad. "
                "Open File Explorer. "

                "Open Downloads. "
                "Open Documents. "
                "Open Desktop. "
                "Open Pictures."
            ),
        )

        # ====================================================
        # BUILD TRANSCRIPT
        # ====================================================

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
            if segment.text
        ).strip()

        print(
            "🗣️ Garuda heard:",
            transcript
        )

        # ====================================================
        # RESPONSE
        # ====================================================

        return {
            "success": True,
            "text": transcript,
            "language": info.language,
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "❌ Voice transcription error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Voice transcription failed.",
        )

    finally:

        # ====================================================
        # DELETE TEMP FILE
        # ====================================================

        if (
            temp_path
            and os.path.exists(temp_path)
        ):

            try:
                os.remove(temp_path)

            except Exception:
                pass