from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Course
from ..core.deps import require_role

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("")
def list_courses(db: Session = Depends(get_db), user=Depends(require_role("student", "teacher"))):
    return [{"id": c.id, "name": c.name, "code": c.code} for c in db.query(Course).order_by(Course.code).all()]
