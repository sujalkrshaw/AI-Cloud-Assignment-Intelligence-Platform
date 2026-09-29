from pathlib import Path
from uuid import uuid4
from ..config import settings

ALLOWED_EXTENSIONS = {"pdf", "txt", "docx"}

def safe_filename(name: str) -> str:
    return Path(name).name.replace(" ", "_")

def save_local(content: bytes, assignment_id: int, student_id: int, filename: str) -> str:
    root = Path(settings.upload_dir) / str(assignment_id) / str(student_id)
    root.mkdir(parents=True, exist_ok=True)
    path = root / f"{uuid4().hex}_{safe_filename(filename)}"
    path.write_bytes(content)
    return str(path)
