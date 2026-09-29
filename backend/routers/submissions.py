from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..config import settings
from ..database import get_db
from ..models import Assignment, Submission, User, SubmissionPolicy
from ..schemas import SubmissionOut
from ..core.deps import current_user, require_role
from ..ai.document import extract_text
from ..cloud.storage import save_local, safe_filename
from ..core.audit import log_event

router = APIRouter(prefix="/submissions", tags=["Submissions"])
ALLOWED = {"pdf":"application/pdf", "txt":"text/plain", "docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}

@router.post("/assignments/{assignment_id}/submit", response_model=SubmissionOut)
async def submit(assignment_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), student: User = Depends(require_role("student"))):
    assignment = db.get(Assignment, assignment_id)
    if not assignment: raise HTTPException(404, "Assignment not found")
    policy = db.query(SubmissionPolicy).filter_by(assignment_id=assignment_id).first()
    prior_count = db.query(Submission).filter_by(assignment_id=assignment_id, student_id=student.id).count()
    if prior_count and policy and (not policy.allow_resubmissions or prior_count >= policy.max_resubmissions + 1):
        raise HTTPException(409, "Resubmission limit reached")
    ext = Path(file.filename or "").suffix.lower().lstrip(".")
    if ext not in {x.strip().lower() for x in assignment.allowed_extensions.split(",")}: raise HTTPException(400, "File extension is not allowed")
    expected = ALLOWED.get(ext)
    if expected and file.content_type and file.content_type != expected:
        # TXT clients sometimes report text/plain variants; accept only the expected type or an empty client type.
        if not (ext == "txt" and file.content_type.startswith("text/")):
            raise HTTPException(400, "File MIME type does not match the allowed extension")
    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024: raise HTTPException(413, "File exceeds maximum upload size")
    stored_path = save_local(content, assignment_id, student.id, file.filename or f"submission.{ext}")
    path = Path(stored_path)
    try:
        text = extract_text(str(path))
    except Exception:
        path.unlink(missing_ok=True); raise HTTPException(400, "Could not extract text from uploaded document")
    effective_deadline = (policy.extension_deadline if policy and policy.extension_deadline else assignment.deadline)
    if datetime.utcnow() > effective_deadline and policy and not policy.allow_late:
        raise HTTPException(400, "Late submissions are disabled for this assignment")
    status = "SUBMITTED" if datetime.utcnow() <= effective_deadline else "LATE"
    sub = Submission(assignment_id=assignment_id, student_id=student.id, file_name=safe_filename(file.filename or path.name), storage_path=str(path), extracted_text=text, status=status)
    db.add(sub); db.commit(); db.refresh(sub); log_event(db,student.id,"SUBMISSION_UPLOADED","submission",sub.id,details={"assignment_id":assignment_id,"status":status})
    return sub

@router.get("/mine", response_model=list[SubmissionOut])
def mine(db: Session = Depends(get_db), student=Depends(require_role("student"))):
    return db.query(Submission).filter(Submission.student_id == student.id).order_by(Submission.submitted_at.desc()).all()

@router.get("/{submission_id}/download")
def download(submission_id: int, db: Session = Depends(get_db), user=Depends(current_user)):
    sub = db.get(Submission, submission_id)
    if not sub: raise HTTPException(404, "Submission not found")
    if user.role == "student" and sub.student_id != user.id: raise HTTPException(403, "Access denied")
    if not Path(sub.storage_path).exists(): raise HTTPException(404, "Stored file not found")
    return FileResponse(sub.storage_path, filename=sub.file_name)

@router.get("/assignment/{assignment_id}", response_model=list[SubmissionOut])
def assignment_submissions(assignment_id: int, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    a = db.get(Assignment, assignment_id)
    if not a or a.created_by != teacher.id: raise HTTPException(403, "Access denied")
    return db.query(Submission).filter(Submission.assignment_id == assignment_id).order_by(Submission.submitted_at.desc()).all()
