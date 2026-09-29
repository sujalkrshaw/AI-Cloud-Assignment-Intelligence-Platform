from datetime import datetime, timedelta
from pathlib import Path
from .database import Base, engine, SessionLocal
from .models import User, UserAdminState, Course, Batch, CourseEnrollment, Assignment, Submission, SubmissionPolicy, AISettings
from .core.security import hash_password
from .config import settings

def seed():
    Base.metadata.create_all(bind=engine); db=SessionLocal()
    try:
        teacher=db.query(User).filter_by(email="teacher@demo.edu").first()
        if not teacher:
            teacher=User(name="Dr. Ananya Sen",email="teacher@demo.edu",password_hash=hash_password(settings.demo_teacher_password),role="teacher"); db.add(teacher); db.commit(); db.refresh(teacher)
        admin=db.query(User).filter_by(email="admin@demo.edu").first()
        if not admin:
            admin=User(name="Platform Administrator",email="admin@demo.edu",password_hash=hash_password(settings.demo_admin_password),role="admin"); db.add(admin); db.commit(); db.refresh(admin)
        for u in [teacher,admin]:
            if not db.query(UserAdminState).filter_by(user_id=u.id).first(): db.add(UserAdminState(user_id=u.id,active=True))
        db.commit()
        s1=db.query(User).filter_by(email="student1@demo.edu").first()
        if not s1:
            s1=User(name="Rahul Das",email="student1@demo.edu",password_hash=hash_password(settings.demo_student_password),role="student"); db.add(s1); db.commit(); db.refresh(s1)
        s2=db.query(User).filter_by(email="student2@demo.edu").first()
        if not s2:
            s2=User(name="Priya Nair",email="student2@demo.edu",password_hash=hash_password(settings.demo_student_password),role="student"); db.add(s2); db.commit(); db.refresh(s2)
        course=db.query(Course).filter_by(code="CC-501").first()
        if not course:
            course=Course(name="Cloud Computing & AI Systems",code="CC-501",teacher_id=teacher.id); db.add(course); db.commit(); db.refresh(course)
        batch=db.query(Batch).filter_by(name="ECE-2026-A").first()
        if not batch:
            batch=Batch(name="ECE-2026-A",semester="5th Semester",department="Electronics & Communication Engineering",academic_year="2026-27"); db.add(batch); db.commit(); db.refresh(batch)
        course.batch_id=batch.id; db.commit()
        for st in [s1,s2]:
            if not db.query(CourseEnrollment).filter_by(course_id=course.id,student_id=st.id).first(): db.add(CourseEnrollment(course_id=course.id,student_id=st.id))
        db.commit()
        assignment=db.query(Assignment).filter_by(title="Cloud Architecture Intelligence Report").first()
        if not assignment:
            assignment=Assignment(course_id=course.id,title="Cloud Architecture Intelligence Report",description="Explain cloud computing architecture, object storage, managed databases, authentication, scalability, availability, API design, and secure deployment. Compare a traditional server architecture with a cloud-native architecture and discuss how object storage should be used for uploaded documents.",deadline=datetime.utcnow()+timedelta(days=14),max_marks=50,rubric="Technical accuracy: 40%; Cloud architecture: 25%; Security: 20%; Clarity and completeness: 15%",created_by=teacher.id); db.add(assignment); db.commit(); db.refresh(assignment)
        sample=Path("sample_files/student1_cloud_report.txt")
        sample.parent.mkdir(exist_ok=True)
        if not sample.exists(): sample.write_text("""Cloud computing provides on-demand access to compute, storage, databases, networking and application services. A cloud-native architecture can use a managed database for structured metadata and object storage for large assignment documents. Authentication establishes identity while role based authorization determines whether a student or teacher can access a resource.

Scalability can be achieved with stateless application servers, load balancing, autoscaling, caching and managed services. Availability improves through redundant infrastructure and health monitoring. API gateways can centralize routing, authentication and rate limiting. Secure deployment requires HTTPS, secret management, least privilege and validation of uploaded files.""",encoding="utf-8")
        if not db.query(SubmissionPolicy).filter_by(assignment_id=assignment.id).first():
            db.add(SubmissionPolicy(assignment_id=assignment.id,allow_late=True,allow_resubmissions=True,max_resubmissions=2))
        if not db.query(AISettings).first(): db.add(AISettings(similarity_warning_threshold=30,relevance_minimum=50))
        db.commit()
        existing=db.query(Submission).filter_by(assignment_id=assignment.id,student_id=s1.id).first()
        if not existing:
            existing=Submission(assignment_id=assignment.id,student_id=s1.id,file_name=sample.name,storage_path=str(sample),extracted_text=sample.read_text(encoding="utf-8"),status="SUBMITTED"); db.add(existing); db.commit()
        print("Seed complete")
    finally: db.close()

if __name__ == "__main__": seed()
