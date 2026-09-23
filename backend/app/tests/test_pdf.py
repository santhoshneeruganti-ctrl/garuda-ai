from pathlib import Path
from app.services.pdf_service import extract_text

pdf_path = Path(__file__).parent / "Director.pdf"

text = extract_text(str(pdf_path))

print(text[:1000])