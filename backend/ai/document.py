from pathlib import Path
import fitz
from docx import Document

def extract_text(path: str) -> str:
    p = Path(path)
    ext = p.suffix.lower()
    if ext == ".pdf":
        doc = fitz.open(path)
        return "\n".join(page.get_text() for page in doc).strip()
    if ext == ".docx":
        doc = Document(path)
        return "\n".join(par.text for par in doc.paragraphs).strip()
    if ext == ".txt":
        return p.read_text(encoding="utf-8", errors="ignore").strip()
    raise ValueError("Unsupported document type")
