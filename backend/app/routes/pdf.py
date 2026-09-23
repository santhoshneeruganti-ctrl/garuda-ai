from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os
import uuid
import time

from app.services.pdf_service import extract_text
from app.services.pdf_chunker import chunk_text
from app.services.pdf_db_service import (
    save_pdf,
    save_chunks,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter()


# ============================================================
# UPLOAD FOLDER
# ============================================================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ============================================================
# PDF UPLOAD
# ============================================================

@router.post("/pdf/upload")
async def upload_pdf(
    chat_id: int = Form(...),
    file: UploadFile = File(...),
):

    start_time = time.perf_counter()

    file_path = None

    try:

        # ====================================================
        # BASIC VALIDATION
        # ====================================================

        if not file.filename:
            return {
                "success": False,
                "message": "No file selected.",
            }


        file_name = file.filename.strip()


        if not file_name.lower().endswith(".pdf"):
            return {
                "success": False,
                "message": "Only PDF files are supported.",
            }


        # ====================================================
        # CREATE UNIQUE FILE NAME
        # ====================================================

        unique_filename = (
            f"{uuid.uuid4()}_{file_name}"
        )


        file_path = os.path.join(
            UPLOAD_FOLDER,
            unique_filename
        )


        # ====================================================
        # SAVE UPLOADED FILE
        # ====================================================

        save_start = time.perf_counter()


        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        save_time = (
            time.perf_counter()
            - save_start
        )


        # ====================================================
        # EXTRACT PDF TEXT
        # ====================================================

        extract_start = (
            time.perf_counter()
        )


        pages = extract_text(
            file_path
        )


        extract_time = (
            time.perf_counter()
            - extract_start
        )


        # ====================================================
        # LOG PDF INFORMATION
        # ====================================================

        print()
        print("=" * 65)
        print("🦅 GARUDA PDF UPLOAD")
        print("=" * 65)

        print(
            "Chat ID       :",
            chat_id
        )

        print(
            "Original PDF  :",
            file_name
        )

        print(
            "Stored File   :",
            unique_filename
        )

        print(
            "Pages         :",
            len(pages)
        )

        print(
            "File Save Time:",
            f"{save_time:.2f}s"
        )

        print(
            "Extract Time  :",
            f"{extract_time:.2f}s"
        )


        if pages:

            print()
            print(
                "FIRST PAGE PREVIEW:"
            )

            print(
                pages[0]["text"][:500]
            )


        print("=" * 65)


        # ====================================================
        # CREATE CHUNKS
        # ====================================================

        chunk_start = (
            time.perf_counter()
        )


        chunks = chunk_text(
            pages
        )


        chunk_time = (
            time.perf_counter()
            - chunk_start
        )


        print(
            "Generated Chunks:",
            len(chunks)
        )

        print(
            "Chunk Time     :",
            f"{chunk_time:.2f}s"
        )


        # ====================================================
        # SAVE PDF METADATA
        # ====================================================

        db_start = (
            time.perf_counter()
        )


        pdf_id = save_pdf(
            chat_id,
            file_name
        )


        print(
            "Database PDF ID:",
            pdf_id
        )


        # ====================================================
        # SAVE CHUNKS + BATCH EMBEDDINGS
        # ====================================================

        embedding_start = (
            time.perf_counter()
        )


        save_chunks(
            pdf_id,
            chunks
        )


        embedding_time = (
            time.perf_counter()
            - embedding_start
        )


        db_time = (
            time.perf_counter()
            - db_start
        )


        print(
            "Embedding/DB Time:",
            f"{embedding_time:.2f}s"
        )


        print(
            "Total DB Time    :",
            f"{db_time:.2f}s"
        )


        # ====================================================
        # TOTAL TIME
        # ====================================================

        total_time = (
            time.perf_counter()
            - start_time
        )


        print()
        print("=" * 65)
        print("✅ PDF SAVED SUCCESSFULLY")
        print("=" * 65)

        print(
            "Total Upload Time:",
            f"{total_time:.2f}s"
        )

        print("=" * 65)
        print()


        # ====================================================
        # RESPONSE
        # ====================================================

        return {
            "success": True,

            "pdf_id": pdf_id,

            "file_name": file_name,

            "chunks": len(chunks),

            "message":
                "PDF uploaded successfully",

            "processing_time":
                round(
                    total_time,
                    2
                ),
        }


    except Exception as error:

        print()
        print("=" * 65)
        print("❌ PDF UPLOAD ERROR")
        print("=" * 65)

        print(
            "File:",
            file.filename
        )

        print(
            "Error:",
            error
        )

        print("=" * 65)


        # ====================================================
        # REMOVE PARTIALLY SAVED FILE
        # ====================================================

        if (
            file_path
            and os.path.exists(file_path)
        ):

            try:

                os.remove(
                    file_path
                )

                print(
                    "🧹 Partial PDF file removed."
                )

            except Exception as cleanup_error:

                print(
                    "⚠️ Cleanup error:",
                    cleanup_error
                )


        return {
            "success": False,

            "message":
                "Unable to process PDF.",

            "error":
                str(error),
        }


    finally:

        # ====================================================
        # CLOSE UPLOAD FILE
        # ====================================================

        try:
            await file.close()

        except Exception:
            pass