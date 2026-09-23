import sqlite3

DATABASE = "garuda.db"


def retrieve_chunks(chat_id: int, query: str, limit: int = 3, pdf_ids=None):
    """
    Strictly retrieves relevant text chunks restricted to the chat session 
    and specific attached PDF IDs. Prevents any global context leakage.
    """
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    words = query.lower().split()
    scores = {}

    # Normalize pdf_ids to a clean list
    clean_pdf_ids = []
    if pdf_ids:
        if isinstance(pdf_ids, list):
            clean_pdf_ids = [pid for pid in pdf_ids if pid is not None]
        else:
            clean_pdf_ids = [pdf_ids]

    if clean_pdf_ids:
        placeholders = ",".join("?" * len(clean_pdf_ids))
        query_sql = f"""
            SELECT
                pdf_chunks.chunk_text,
                pdf_chunks.pdf_id
            FROM pdf_chunks
            JOIN pdfs
            ON pdf_chunks.pdf_id = pdfs.id
            WHERE pdfs.chat_id = ? AND pdf_chunks.pdf_id IN ({placeholders})
        """
        cursor.execute(query_sql, (chat_id, *clean_pdf_ids))
    else:
        # Strictly bound to chat_id if no specific PDF IDs are explicitly passed
        query_sql = """
            SELECT
                pdf_chunks.chunk_text,
                pdf_chunks.pdf_id
            FROM pdf_chunks
            JOIN pdfs
            ON pdf_chunks.pdf_id = pdfs.id
            WHERE pdfs.chat_id = ?
        """
        cursor.execute(query_sql, (chat_id,))

    rows = cursor.fetchall()
    conn.close()

    for row in rows:
        chunk = row["chunk_text"]
        score = 0
        lower_chunk = chunk.lower()

        for word in words:
            score += lower_chunk.count(word)

        # Keep chunks even with base score or matching keywords to ensure context availability
        if score > 0 or not words:
            scores[chunk] = max(score, 1)

    ranked = sorted(
        scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        chunk
        for chunk, _ in ranked[:limit]
    ]