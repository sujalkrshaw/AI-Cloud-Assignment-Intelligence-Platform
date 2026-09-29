import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserAdminState, Batch, Course, CourseEnrollment, AuditLog, AISettings
from ..core.deps import require_role
from ..core.audit import log_event

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/overview")
def overview(db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    return {"users": db.query(User).count(), "students": db.query(User).filter_by(role="student").count(),
            "teachers": db.query(User).filter_by(role="teacher").count(), "admins": db.query(User).filter_by(role="admin").count(),
            "courses": db.query(Course).count(), "batches": db.query(Batch).count(), "audit_events": db.query(AuditLog).count()}

@router.get("/users")
def users(db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    rows=[]
    for u in db.query(User).order_by(User.created_at.desc()).all():
        state=db.query(UserAdminState).filter_by(user_id=u.id).first()
        rows.append({"id":u.id,"name":u.name,"email":u.email,"role":u.role,"active":state.active if state else True,"created_at":u.created_at.isoformat()})
    return rows

@router.patch("/users/{user_id}")
def update_user(user_id:int, payload:dict, db:Session=Depends(get_db), admin=Depends(require_role("admin"))):
    user=db.get(User,user_id)
    if not user: raise HTTPException(404,"User not found")
    if user.id==admin.id and payload.get("active") is False: raise HTTPException(400,"Admin cannot deactivate the current account")
    if payload.get("role") in {"student","teacher","admin"}: user.role=payload["role"]
    state=db.query(UserAdminState).filter_by(user_id=user.id).first()
    if not state: state=UserAdminState(user_id=user.id,active=True); db.add(state)
    if "active" in payload: state.active=bool(payload["active"])
    db.commit(); log_event(db,admin.id,"USER_ADMIN_UPDATED","user",user.id,details=payload)
    return {"id":user.id,"role":user.role,"active":state.active}

@router.get("/audit-logs")
def audit_logs(db:Session=Depends(get_db), admin=Depends(require_role("admin"))):
    rows=db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
    return [{"id":r.id,"actor_user_id":r.actor_user_id,"action":r.action,"resource_type":r.resource_type,"resource_id":r.resource_id,"severity":r.severity,"details":r.details,"created_at":r.created_at.isoformat()} for r in rows]

@router.get("/courses")
def courses(db:Session=Depends(get_db), admin=Depends(require_role("admin"))):
    return [{"id":c.id,"name":c.name,"code":c.code,"teacher_id":c.teacher_id,"batch_id":c.batch_id} for c in db.query(Course).order_by(Course.code).all()]

@router.get("/batches")
def batches(db:Session=Depends(get_db), admin=Depends(require_role("admin"))):
    return [{"id":b.id,"name":b.name,"semester":b.semester,"department":b.department,"academic_year":b.academic_year} for b in db.query(Batch).order_by(Batch.name).all()]

@router.post("/batches")
def create_batch(payload:dict, db:Session=Depends(get_db), admin=Depends(require_role("admin"))):
    b=Batch(name=payload["name"],semester=payload["semester"],department=payload["department"],academic_year=payload["academic_year"])
    db.add(b); db.commit(); db.refresh(b); log_event(db,admin.id,"BATCH_CREATED","batch",b.id,details=payload)
    return {"id":b.id,"name":b.name,"semester":b.semester,"department":b.department,"academic_year":b.academic_year}

@router.post("/courses")
def create_course(payload:dict, db:Session=Depends(get_db), admin=Depends(require_role("admin"))):
    teacher=db.get(User,int(payload["teacher_id"]))
    if not teacher or teacher.role not in {"teacher","admin"}: raise HTTPException(400,"Valid teacher required")
    c=Course(name=payload["name"],code=payload["code"],teacher_id=teacher.id,batch_id=payload.get("batch_id"))
    db.add(c); db.commit(); db.refresh(c); log_event(db,admin.id,"COURSE_CREATED","course",c.id,details=payload)
    return {"id":c.id,"name":c.name,"code":c.code,"teacher_id":c.teacher_id,"batch_id":c.batch_id}

@router.get("/ai-settings")
def ai_settings(db:Session=Depends(get_db), admin=Depends(require_role("admin"))):
    s=db.query(AISettings).first()
    if not s:
        s=AISettings(); db.add(s); db.commit(); db.refresh(s)
    return {"similarity_warning_threshold":s.similarity_warning_threshold,"relevance_minimum":s.relevance_minimum}

@router.put("/ai-settings")
def update_ai_settings(payload:dict, db:Session=Depends(get_db), admin=Depends(require_role("admin"))):
    s=db.query(AISettings).first() or AISettings()
    if not s.id: db.add(s)
    s.similarity_warning_threshold=float(payload.get("similarity_warning_threshold",s.similarity_warning_threshold))
    s.relevance_minimum=float(payload.get("relevance_minimum",s.relevance_minimum)); s.updated_by=admin.id
    db.commit(); log_event(db,admin.id,"AI_SETTINGS_UPDATED","ai_settings",s.id,details=payload)
    return {"similarity_warning_threshold":s.similarity_warning_threshold,"relevance_minimum":s.relevance_minimum}
