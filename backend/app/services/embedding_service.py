from typing import List, Optional
import numpy as np


# ============================================================
# LAZY-LOADED EMBEDDING MODEL
# ============================================================
#
# IMPORTANT:
# Do NOT load SentenceTransformer when FastAPI starts.
# The model is loaded only when an embedding is actually needed.
#
# This significantly reduces Render startup memory usage.
# ============================================================

_model = None


def get_model():
    """
    Load the embedding model only when it is actually needed.

    Keeping the import and model initialization inside this
    function prevents Sentence Transformers / PyTorch from
    consuming memory during normal FastAPI startup.
    """

    global _model

    if _model is None:
        from sentence_transformers import SentenceTransformer

        print("Garuda Embedding: Loading all-MiniLM-L6-v2...")

        _model = SentenceTransformer(
            "all-MiniLM-L6-v2",
            device="cpu"
        )

        print("Garuda Embedding: Model loaded successfully.")

    return _model


# ============================================================
# CREATE SINGLE EMBEDDING
# ============================================================

def create_embedding(text: str):
    """
    Create an embedding for a single piece of text.

    The model is loaded lazily only when this function is called.
    """

    model = get_model()

    return model.encode(
        text,
        convert_to_numpy=True,
        show_progress_bar=False
    )


# ============================================================
# CREATE BATCH EMBEDDINGS
# ============================================================

def create_embeddings(
    texts: List[str],
    batch_size: int = 8
):
    """
    Create embeddings for multiple texts.

    A smaller batch size is used to reduce peak RAM usage on
    low-memory deployment environments such as Render Free.
    """

    if not texts:
        return np.array([])

    model = get_model()

    return model.encode(
        texts,
        batch_size=batch_size,
        convert_to_numpy=True,
        show_progress_bar=False
    )