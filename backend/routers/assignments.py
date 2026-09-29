from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Assignment, Course
from ..schemas import AssignmentCreate, AssignmentOut
from ..core.deps import require_role

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.get("", response_model=list[AssignmentOut])
def list_assignments(db: Session = Depends(get_db), user=Depends(require_role("student","teacher"))):
    q = db.query(Assignment)
    if user.role == "teacher":
        q = q.filter(Assignment.created_by == user.id)
    return q.order_by(Assignment.deadline.asc()).all()

@router.post("", response_model=AssignmentOut)
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db), teacher=Depends(require_role("teacher"))):
    course = db.get(Course, payload.course_id)
    if not course: raise HTTPException(404, "Course not found")
    a = Assignment(**payload.model_dump(), created_by=teacher.id)
    db.add(a); db.commit(); db.refresh(a); return a

@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(assignment_id: int, db: Session = Depends(get_db), user=Depends(require_role("student","teacher"))):
    a = db.get(Assignment, assignment_id)
    if not a: raise HTTPException(404, "Assignment not found")
    return a
