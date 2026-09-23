from fastapi import APIRouter, UploadFile, File, HTTPException
from faster_whisper import WhisperModel

import tempfile
import os


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


# ======================================================
# WHISPER MODEL
# ======================================================

print(
    "🦅 Loading Garuda Whisper model..."
)


model = WhisperModel(
    "base.en",
    device="cpu",
    compute_type="int8",
)


print(
    "✅ Garuda Whisper model loaded successfully"
)


# ======================================================
# TRANSCRIBE VOICE
# ======================================================

@router.post("/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...)
):

    temp_path = None

    try:

        # ==================================================
        # VALIDATE FILE
        # ==================================================

        if not audio:

            raise HTTPException(
                status_code=400,
                detail="No audio file received.",
            )

        # ==================================================
        # READ AUDIO
        # ==================================================

        content =await audio.read()

        if not content:

            raise HTTPException(
                status_code=400,
                detail="Empty audio file received.",
            )

        print(
            f"🎤 Voice received: {len(content)} bytes"
        )

        # ==================================================
        # CREATE TEMP FILE
        # ==================================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".webm",
        ) as temp_file:

            temp_path = temp_file.name

            temp_file.write(
                content
            )

        # ==================================================
        # TRANSCRIBE
        # ==================================================

        segments, info =model.transcribe(

                temp_path,

                language="en",

                beam_size=5,

                best_of=5,

                temperature=0.0,

                condition_on_previous_text=False,

                vad_filter=True,

                vad_parameters={

                    "min_silence_duration_ms":
                        500,

                    "speech_pad_ms":
                        250,

                    "min_speech_duration_ms":
                        200,
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

        # ==================================================
        # BUILD TRANSCRIPT
        # ==================================================

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
            if segment.text
        ).strip()

        print(
            "🗣️ Garuda heard:",
            transcript
        )

        # ==================================================
        # RESPONSE
        # ==================================================

        return {

            "success":
                True,

            "text":
                transcript,

            "language":
                info.language,
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

        # ==================================================
        # DELETE TEMP FILE
        # ==================================================

        if (
            temp_path
            and os.path.exists(
                temp_path
            )
        ):

            try:

                os.remove(
                    temp_path
                )

            except Exception:
                pass