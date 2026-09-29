from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Submission, Assignment
from ..schemas import GradeRequest, SubmissionOut
from ..core.deps import require_role
from ..core.audit import log_event

router = APIRouter(prefix="/grading", tags=["Grading"])

@router.post("/submissions/{submission_id}", response_model=SubmissionOut)
def grade(submission_id: int, payload: GradeRequest, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    sub = db.get(Submission, submission_id)
    if not sub: raise HTTPException(404, "Submission not found")
    assignment = db.get(Assignment, sub.assignment_id)
    if assignment.created_by != teacher.id: raise HTTPException(403, "Access denied")
    if payload.marks > assignment.max_marks: raise HTTPException(400, "Marks cannot exceed maximum marks")
    sub.marks = payload.marks; sub.feedback = payload.feedback; sub.graded_at = datetime.utcnow(); sub.status = "GRADED"
    db.commit(); db.refresh(sub); log_event(db,teacher.id,"GRADE_PUBLISHED","submission",sub.id,details={"marks":payload.marks}); return sub
