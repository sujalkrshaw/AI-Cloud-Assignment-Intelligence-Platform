from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Assignment, Submission
from ..core.deps import require_role

router=APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/student")
def student_dashboard(db: Session=Depends(get_db), user=Depends(require_role("student"))):
    rows=db.query(Submission).filter(Submission.student_id==user.id).all()
    return {"total_assignments":db.query(Assignment).count(),"submitted":len(rows),"graded":sum(x.status=="GRADED" for x in rows),"late":sum(x.status=="LATE" for x in rows),"average_marks":round(sum(x.marks or 0 for x in rows if x.marks is not None)/max(1,sum(x.marks is not None for x in rows)),1)}

@router.get("/teacher")
def teacher_dashboard(db: Session=Depends(get_db), user=Depends(require_role("teacher"))):
    assignments=db.query(Assignment).filter(Assignment.created_by==user.id).all(); ids=[a.id for a in assignments]
    rows=db.query(Submission).filter(Submission.assignment_id.in_(ids)).all() if ids else []
    return {"assignments":len(assignments),"submissions":len(rows),"pending":sum(x.status!="GRADED" for x in rows),"graded":sum(x.status=="GRADED" for x in rows),"late":sum(x.status=="LATE" for x in rows)}
