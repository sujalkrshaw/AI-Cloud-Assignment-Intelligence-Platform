import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Submission, Assignment, AIAnalysis, AISettings
from ..core.deps import require_role
from ..core.audit import log_event
from ..ai.engine import suggested_grade, similarity

router=APIRouter(prefix="/ai",tags=["AI Intelligence"])

@router.post("/submissions/{submission_id}/analyze")
def analyze(submission_id:int,db:Session=Depends(get_db),teacher=Depends(require_role("teacher"))):
    sub=db.get(Submission,submission_id)
    if not sub: raise HTTPException(404,"Submission not found")
    assignment=db.get(Assignment,sub.assignment_id)
    if assignment.created_by!=teacher.id: raise HTTPException(403,"Access denied")
    marks,rel,feedback,matrix=suggested_grade(sub.extracted_text,assignment.description,assignment.rubric,assignment.max_marks)
    others=db.query(Submission).filter(Submission.assignment_id==assignment.id,Submission.id!=sub.id).all()
    sims=[similarity(sub.extracted_text,x.extracted_text) for x in others if x.extracted_text]
    sim=max(sims) if sims else 0.0
    settings=db.query(AISettings).first() or AISettings()
    flagged=sim>=settings.similarity_warning_threshold
    analysis=AIAnalysis(submission_id=sub.id,word_count=len(sub.extracted_text.split()),keyword_score=rel,similarity_score=sim,relevance_score=rel,suggested_marks=marks,generated_feedback=feedback,rubric_matrix=json.dumps(matrix),similarity_flag=flagged)
    db.add(analysis); db.commit(); db.refresh(analysis); log_event(db,teacher.id,"AI_ANALYSIS_CREATED","submission",sub.id,details={"similarity":sim,"flagged":flagged})
    return {"id":analysis.id,"submission_id":sub.id,"word_count":analysis.word_count,"keyword_score":rel,"similarity_score":sim,"similarity_flag":flagged,"relevance_score":rel,"suggested_marks":marks,"feedback":feedback,"rubric_matrix":matrix,"model":analysis.model_name}

@router.get("/submissions/{submission_id}/analysis")
def get_analysis(submission_id:int,db:Session=Depends(get_db),user=Depends(require_role("student","teacher"))):
    sub=db.get(Submission,submission_id)
    if not sub: raise HTTPException(404,"Submission not found")
    if user.role=="student" and sub.student_id!=user.id: raise HTTPException(403,"Access denied")
    a=db.query(AIAnalysis).filter(AIAnalysis.submission_id==submission_id).order_by(AIAnalysis.created_at.desc()).first()
    if not a: raise HTTPException(404,"AI analysis not generated yet")
    return {"id":a.id,"word_count":a.word_count,"keyword_score":a.keyword_score,"similarity_score":a.similarity_score,"similarity_flag":a.similarity_flag,"relevance_score":a.relevance_score,"suggested_marks":a.suggested_marks,"feedback":a.generated_feedback,"rubric_matrix":json.loads(a.rubric_matrix or "[]"),"model":a.model_name}
