from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Assignment, SubmissionPolicy
from ..core.deps import require_role
from ..core.audit import log_event

router=APIRouter(prefix="/resubmission",tags=["Resubmission Control"])

@router.get("/{assignment_id}")
def get_policy(assignment_id:int,db:Session=Depends(get_db),user=Depends(require_role("teacher","admin"))):
    p=db.query(SubmissionPolicy).filter_by(assignment_id=assignment_id).first() or SubmissionPolicy(assignment_id=assignment_id)
    return {"assignment_id":assignment_id,"allow_late":p.allow_late,"allow_resubmissions":p.allow_resubmissions,"max_resubmissions":p.max_resubmissions,"extension_deadline":p.extension_deadline.isoformat() if p.extension_deadline else None}

@router.put("/{assignment_id}")
def update_policy(assignment_id:int,payload:dict,db:Session=Depends(get_db),teacher=Depends(require_role("teacher","admin"))):
    a=db.get(Assignment,assignment_id)
    if not a: raise HTTPException(404,"Assignment not found")
    if teacher.role=="teacher" and a.created_by!=teacher.id: raise HTTPException(403,"Access denied")
    p=db.query(SubmissionPolicy).filter_by(assignment_id=assignment_id).first() or SubmissionPolicy(assignment_id=assignment_id)
    if not p.id: db.add(p)
    p.allow_late=bool(payload.get("allow_late",p.allow_late)); p.allow_resubmissions=bool(payload.get("allow_resubmissions",p.allow_resubmissions)); p.max_resubmissions=int(payload.get("max_resubmissions",p.max_resubmissions))
    if payload.get("extension_deadline"): from datetime import datetime; p.extension_deadline=datetime.fromisoformat(payload["extension_deadline"].replace("Z","+00:00")).replace(tzinfo=None)
    db.commit(); log_event(db,teacher.id,"RESUBMISSION_POLICY_UPDATED","assignment",assignment_id,details=payload)
    return {"assignment_id":assignment_id,"allow_late":p.allow_late,"allow_resubmissions":p.allow_resubmissions,"max_resubmissions":p.max_resubmissions,"extension_deadline":p.extension_deadline.isoformat() if p.extension_deadline else None}
