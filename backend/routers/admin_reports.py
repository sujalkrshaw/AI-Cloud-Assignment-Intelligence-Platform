import csv, io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, Response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from ..database import get_db
from ..models import Submission, Assignment, User
from ..core.deps import require_role

router=APIRouter(prefix="/reports",tags=["Reports"])

def rows(db):
    q=db.query(Submission,Assignment,User).join(Assignment,Submission.assignment_id==Assignment.id).join(User,Submission.student_id==User.id).all()
    return q

@router.get("/submissions.csv")
def csv_export(db=Depends(get_db), teacher=Depends(require_role("teacher","admin"))):
    out=io.StringIO(); w=csv.writer(out); w.writerow(["submission_id","assignment","student","email","status","marks","submitted_at","feedback"])
    for s,a,u in rows(db):
        if teacher.role=="teacher" and a.created_by!=teacher.id: continue
        w.writerow([s.id,a.title,u.name,u.email,s.status,s.marks,s.submitted_at.isoformat(),s.feedback or ""])
    return StreamingResponse(iter([out.getvalue()]),media_type="text/csv",headers={"Content-Disposition":"attachment; filename=assignment_report.csv"})

@router.get("/submissions.pdf")
def pdf_export(db=Depends(get_db), teacher=Depends(require_role("teacher","admin"))):
    buf=io.BytesIO(); c=canvas.Canvas(buf,pagesize=A4); width,height=A4; y=height-40
    c.setFont("Helvetica-Bold",14); c.drawString(40,y,"AI Assignment Intelligence - Submission Report"); y-=25; c.setFont("Helvetica",8)
    for s,a,u in rows(db):
        if teacher.role=="teacher" and a.created_by!=teacher.id: continue
        line=f"#{s.id} | {a.title[:35]} | {u.name[:22]} | {s.status} | {s.marks if s.marks is not None else '-'}"
        c.drawString(40,y,line); y-=13
        if y<45: c.showPage(); y=height-40; c.setFont("Helvetica",8)
    c.save(); buf.seek(0); return Response(buf.read(),media_type="application/pdf",headers={"Content-Disposition":"attachment; filename=assignment_report.pdf"})
