from sentence_transformers import SentenceTransformer
from typing import List

# ============================================================
# EMBEDDING MODEL
# ============================================================

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ============================================================
# CREATE SINGLE EMBEDDING
# ============================================================

def create_embedding(text: str):
    """
    Create an embedding for a single piece of text.

    Kept for existing search functionality and backward
    compatibility.
    """

    return model.encode(
        text,
        convert_to_numpy=True
    )


# ============================================================
# CREATE BATCH EMBEDDINGS
# ============================================================

def create_embeddings(
    texts: List[str],
    batch_size: int = 32
):
    """
    Create embeddings for multiple texts in batches.

    This is significantly more efficient than calling
    model.encode() separately for every PDF chunk.

    Parameters:
        texts:
            List of chunk texts.

        batch_size:
            Number of texts processed together.

    Returns:
        NumPy array containing one embedding per text.
    """

    if not texts:
        return []

    return model.encode(
        texts,
        batch_size=batch_size,
        convert_to_numpy=True,
        show_progress_bar=False
    )