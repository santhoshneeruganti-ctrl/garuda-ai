import re
import sqlite3
import numpy as np
from typing import List, Dict, Any, Optional

from app.services.embedding_service import create_embedding

DATABASE = "garuda.db"


# ==================================================
# Cosine Similarity
# ==================================================

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(np.dot(a, b) / (norm_a * norm_b))


# ==================================================
# SQLite BLOB -> NumPy
# ==================================================

def blob_to_embedding(blob: Optional[bytes]) -> Optional[np.ndarray]:
    if blob is None:
        return None
    return np.frombuffer(blob, dtype=np.float32)


# ==================================================
# Helper Database Lookups
# ==================================================

def get_latest_pdf_id(chat_id: int) -> Optional[int]:
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id
            FROM pdfs
            WHERE chat_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (chat_id,)
        )
        row = cursor.fetchone()
        return row["id"] if row else None
    finally:
        cursor.close()
        conn.close()


def get_pdf_filename(pdf_id: int) -> Optional[str]:
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT file_name
            FROM pdfs
            WHERE id = ?
            LIMIT 1
            """,
            (pdf_id,)
        )
        row = cursor.fetchone()
        return row["file_name"] if row else None
    finally:
        cursor.close()
        conn.close()


def find_pdf_by_filename(chat_id: int, file_name: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, file_name, uploaded_at
            FROM pdfs
            WHERE chat_id = ?
              AND LOWER(file_name) = LOWER(?)
            ORDER BY id DESC
            LIMIT 1
            """,
            (chat_id, file_name)
        )
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        cursor.close()
        conn.close()


# ==================================================
# Normalize Filename
# ==================================================

def normalize_pdf_name(file_name: str) -> str:
    if not file_name:
        return ""

    name = file_name.lower().strip()
    if name.endswith(".pdf"):
        name = name[:-4]

    name = re.sub(r"[_\-]+", " ", name)
    name = re.sub(r"[^\w\s]", " ", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


# ==================================================
# Get Chat PDFs
# ==================================================

def get_chat_pdfs(chat_id: int) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, file_name, uploaded_at, is_active
            FROM pdfs
            WHERE chat_id = ?
            ORDER BY id DESC
            """,
            (chat_id,)
        )
        rows = cursor.fetchall()

        pdfs = []
        seen_names = set()

        for row in rows:
            normalized_name = normalize_pdf_name(row["file_name"])
            if not normalized_name or normalized_name in seen_names:
                continue

            seen_names.add(normalized_name)
            pdfs.append({
                "id": row["id"],
                "file_name": row["file_name"],
                "normalized_name": normalized_name,
                "uploaded_at": row["uploaded_at"],
                "is_active": row["is_active"]
            })

        return pdfs
    finally:
        cursor.close()
        conn.close()


# ==================================================
# Broad Request Detector
# ==================================================

def is_broad_pdf_request(query: str) -> bool:
    query = query.lower().strip()
    broad_phrases = [
        "summarize", "summerize", "summarise", "summary",
        "overview", "explain this pdf", "main points", "key points",
        "what does this pdf contain", "describe all", "all documents"
    ]
    return any(phrase in query for phrase in broad_phrases)


# ==================================================
# Rank Chunks with Metadata
# ==================================================

def rank_chunks_with_metadata(
    rows: List[sqlite3.Row],
    query: str,
    limit: int = 4,
    threshold: float = 0.20
) -> List[Dict[str, Any]]:
    if not rows or not query.strip():
        return []

    is_broad = is_broad_pdf_request(query)

    if is_broad:
        selected_rows = rows[:limit]
        return [
            {
                "pdf_id": row["pdf_id"],
                "file_name": row["file_name"],
                "chunk_index": row["chunk_index"],
                "chunk_text": row["chunk_text"],
                "similarity": 1.0,
                "formatted_context": f"[Source: {row['file_name']} (Chunk {row['chunk_index']})]:\n{row['chunk_text']}"
            }
            for row in selected_rows
        ]

    query_embedding = create_embedding(query).astype(np.float32)
    scored_items = []

    for row in rows:
        chunk = row["chunk_text"]
        embedding_blob = row["embedding"]

        if embedding_blob is not None:
            chunk_embedding = blob_to_embedding(embedding_blob)
        else:
            chunk_embedding = create_embedding(chunk).astype(np.float32)

        similarity = cosine_similarity(query_embedding, chunk_embedding)

        scored_items.append({
            "pdf_id": row["pdf_id"],
            "file_name": row["file_name"],
            "chunk_index": row["chunk_index"],
            "chunk_text": chunk,
            "similarity": similarity,
            "formatted_context": f"[Source: {row['file_name']} (Section {row['chunk_index']})]:\n{chunk}"
        })

    scored_items.sort(key=lambda x: x["similarity"], reverse=True)

    filtered = [item for item in scored_items if item["similarity"] >= threshold]
    if not filtered:
        filtered = scored_items[:limit]
    else:
        filtered = filtered[:limit]

    return filtered


# ==================================================
# Legacy Compatibility: rank_chunks
# ==================================================

def rank_chunks(
    rows,
    query,
    limit=3,
    threshold=0.20
):
    if not rows or not query.strip():
        return []

    if is_broad_pdf_request(query):
        max_summary_chunks = 10
        selected_rows = rows[:max_summary_chunks]
        return [row["chunk_text"] for row in selected_rows]

    query_embedding = create_embedding(query).astype(np.float32)
    scores = []

    for row in rows:
        chunk = row["chunk_text"]
        embedding_blob = row["embedding"]

        if embedding_blob is not None:
            chunk_embedding = blob_to_embedding(embedding_blob)
        else:
            chunk_embedding = create_embedding(chunk).astype(np.float32)

        similarity = cosine_similarity(query_embedding, chunk_embedding)
        scores.append((similarity, chunk))

    scores.sort(key=lambda item: item[0], reverse=True)
    filtered_scores = [(similarity, chunk) for similarity, chunk in scores if similarity >= threshold]

    if not filtered_scores:
        selected_chunks = scores[:limit]
    else:
        selected_chunks = filtered_scores[:limit]

    return [chunk for _, chunk in selected_chunks]


# ==================================================
# Legacy Compatibility: Single PDF Search Functions
# ==================================================

def semantic_search_by_pdf_id(
    pdf_id: int,
    query: str,
    limit: int = 3,
    threshold: float = 0.20
):
    if not pdf_id or not query.strip():
        return []

    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT chunk_index, chunk_text, embedding
            FROM pdf_chunks
            WHERE pdf_id = ?
            ORDER BY chunk_index ASC
            """,
            (pdf_id,)
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return rank_chunks(rows, query, limit, threshold)


def semantic_search(
    chat_id: int,
    query: str,
    limit: int = 3,
    threshold: float = 0.20
):
    active_id = get_latest_pdf_id(chat_id)
    if not active_id:
        return []
    return semantic_search_by_pdf_id(active_id, query, limit, threshold)


def resolve_pdfs_from_query(chat_id: int, query: str):
    all_pdfs = get_chat_pdfs(chat_id)
    norm_query = normalize_pdf_name(query)

    matched = []
    for pdf in all_pdfs:
        pattern = r"(?<!\w)" + re.escape(pdf["normalized_name"]) + r"(?!\w)"
        if re.search(pattern, norm_query):
            matched.append(pdf)

    return {"matched": matched, "ambiguous": []}


# ==================================================
# Multi-PDF Semantic Search (Speed Optimized)
# ==================================================

def multi_pdf_semantic_search(
    chat_id: int,
    query: str,
    target_pdf_ids: Optional[List[int]] = None,
    limit_per_pdf: int = 3,
    overall_limit: int = 4,  # Optimized for lightning fast response (< 3s)
    threshold: float = 0.20
) -> Dict[str, Any]:
    if not query.strip():
        return {"chunks": [], "context_string": "", "sources": []}

    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        if target_pdf_ids and len(target_pdf_ids) > 0:
            placeholders = ",".join("?" for _ in target_pdf_ids)
            cursor.execute(
                f"""
                SELECT p.id as pdf_id, p.file_name, c.chunk_index, c.chunk_text, c.embedding
                FROM pdfs p
                JOIN pdf_chunks c ON p.id = c.pdf_id
                WHERE p.chat_id = ? AND p.id IN ({placeholders})
                ORDER BY c.chunk_index ASC
                """,
                [chat_id, *target_pdf_ids]
            )
        else:
            cursor.execute(
                """
                SELECT p.id as pdf_id, p.file_name, c.chunk_index, c.chunk_text, c.embedding
                FROM pdfs p
                JOIN pdf_chunks c ON p.id = c.pdf_id
                WHERE p.chat_id = ? AND p.is_active = 1
                ORDER BY c.chunk_index ASC
                """,
                (chat_id,)
            )

        rows = cursor.fetchall()
        if not rows:
            return {"chunks": [], "context_string": "", "sources": []}

        ranked = rank_chunks_with_metadata(
            rows=rows,
            query=query,
            limit=overall_limit,
            threshold=threshold
        )

        sources = list({item["file_name"] for item in ranked})
        context_string = "\n\n---\n\n".join(item["formatted_context"] for item in ranked)

        return {
            "chunks": ranked,
            "context_string": context_string,
            "sources": sources
        }
    finally:
        cursor.close()
        conn.close()


def resolve_and_search(chat_id: int, query: str) -> Dict[str, Any]:
    all_pdfs = get_chat_pdfs(chat_id)
    norm_query = normalize_pdf_name(query)

    matched_ids = []
    for pdf in all_pdfs:
        pattern = r"(?<!\w)" + re.escape(pdf["normalized_name"]) + r"(?!\w)"
        if re.search(pattern, norm_query):
            matched_ids.append(pdf["id"])

    if matched_ids:
        return multi_pdf_semantic_search(
            chat_id=chat_id,
            query=query,
            target_pdf_ids=matched_ids,
            overall_limit=4  # Lightning fast response limit
        )

    return multi_pdf_semantic_search(
        chat_id=chat_id,
        query=query,
        target_pdf_ids=None,
        overall_limit=4  # Lightning fast response limit
    )