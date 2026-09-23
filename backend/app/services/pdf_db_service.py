import sqlite3

from app.services.embedding_service import (
    create_embedding,
    create_embeddings,
)

DATABASE = "garuda.db"


# ==================================================
# Save PDF
# ==================================================

def save_pdf(chat_id, file_name):
    """
    Save a newly uploaded PDF.

    Every uploaded PDF is stored permanently.

    The latest uploaded PDF is determined
    using ORDER BY id DESC whenever required.
    """

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO pdfs(
                chat_id,
                file_name
            )
            VALUES (?, ?)
            """,
            (
                chat_id,
                file_name,
            ),
        )

        pdf_id = cursor.lastrowid

        conn.commit()

        return pdf_id

    finally:

        cursor.close()
        conn.close()


# ==================================================
# Save PDF Chunks
# ==================================================

def save_chunks(pdf_id, chunks):
    """
    Save page-aware PDF chunks together
    with embeddings.

    Embeddings are generated in batches instead of
    calling the embedding model once for every chunk.
    """

    if not chunks:
        print(
            f"⚠️ No chunks to save for PDF {pdf_id}"
        )
        return

    # ==================================================
    # PREPARE VALID CHUNKS
    # ==================================================

    valid_chunks = []

    for index, chunk_data in enumerate(chunks):

        page_number = chunk_data.get(
            "page_number"
        )

        chunk_text = chunk_data.get(
            "chunk_text",
            ""
        ).strip()

        if not chunk_text:
            continue

        valid_chunks.append(
            {
                "chunk_index": index,
                "page_number": page_number,
                "chunk_text": chunk_text,
            }
        )

    if not valid_chunks:
        print(
            f"⚠️ No valid chunks to save for PDF {pdf_id}"
        )
        return

    # ==================================================
    # CREATE ALL EMBEDDINGS IN BATCHES
    # ==================================================

    texts = [
        item["chunk_text"]
        for item in valid_chunks
    ]

    embeddings = create_embeddings(
        texts,
        batch_size=32
    )

    # ==================================================
    # SAVE CHUNKS + EMBEDDINGS
    # ==================================================

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    try:

        for item, embedding in zip(
            valid_chunks,
            embeddings
        ):

            embedding_blob = (
                embedding
                .astype("float32")
                .tobytes()
            )

            cursor.execute(
                """
                INSERT INTO pdf_chunks(
                    pdf_id,
                    chunk_index,
                    chunk_text,
                    page_number,
                    embedding
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    pdf_id,
                    item["chunk_index"],
                    item["chunk_text"],
                    item["page_number"],
                    embedding_blob,
                ),
            )

        conn.commit()

        print(
            f"✅ Saved {len(valid_chunks)} "
            f"page-aware chunks for PDF {pdf_id}"
        )

    except Exception:

        conn.rollback()
        raise

    finally:

        cursor.close()
        conn.close()


# ==================================================
# Latest Uploaded PDF
# ==================================================

def get_latest_pdf(chat_id):
    """
    Return the latest uploaded PDF
    for this chat.

    ChatGPT-style behaviour:
    The newest uploaded PDF becomes
    the default document.
    """

    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            SELECT
                id,
                chat_id,
                file_name,
                uploaded_at
            FROM pdfs
            WHERE chat_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (chat_id,),
        )

        row = cursor.fetchone()

        return dict(row) if row else None

    finally:

        cursor.close()
        conn.close()