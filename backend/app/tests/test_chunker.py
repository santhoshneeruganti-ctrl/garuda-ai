from pathlib import Path

from app.services.pdf_service import extract_text
from app.services.pdf_chunker import chunk_text


pdf_path = Path(__file__).parent / "Director.pdf"

text = extract_text(str(pdf_path))

chunks = chunk_text(text)

print("Total Chunks:", len(chunks))

print("\nFirst Chunk:\n")

print(chunks[0])

print("\nSecond Chunk:\n")

print(chunks[1])