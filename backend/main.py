from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import auth, assignments, submissions, ai, grading, dashboard, courses, analytics, admin, admin_reports, enterprise_analytics, resubmissions, system

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)
app=FastAPI(title="AI Cloud Assignment Intelligence Platform", version="1.0.0", description="Industry-oriented cloud and AI assignment workflow API")
origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(grading.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(admin_reports.router, prefix="/api")
app.include_router(enterprise_analytics.router, prefix="/api")
app.include_router(resubmissions.router, prefix="/api")
app.include_router(system.router, prefix="/api")

@app.get("/health")
def health(): return {"status":"ok","service":"assignment-intelligence-api"}

@app.get("/")
def root(): return {"name":app.title,"docs":"/docs","health":"/health"}
