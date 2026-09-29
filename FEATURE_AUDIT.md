# Feature Audit — AI-Powered Cloud Assignment Intelligence Platform

This file maps the requested enterprise blueprint to implemented repository components.

## Implemented

- JWT authentication and bcrypt password hashing: `backend/core/security.py`, `backend/routers/auth.py`
- Backend RBAC with teacher/student/admin roles: `backend/core/deps.py`
- RBAC denial audit trail: `backend/core/deps.py`, `backend/core/audit.py`
- Admin user governance (role changes + activate/deactivate): `backend/routers/admin.py`
- Audit log viewer: `backend/routers/admin.py`
- Course and batch administration: `backend/routers/admin.py`
- Course/batch seed data: `backend/seed.py`
- Secure PDF/DOCX/TXT uploads with MIME/extension/size validation: `backend/routers/submissions.py`
- UUID-based storage naming through storage adapter: `backend/cloud/storage.py`
- Local object-storage abstraction: `backend/cloud/storage.py`
- AI document extraction: `backend/ai/document.py`
- TF-IDF + cosine similarity: `backend/ai/engine.py`
- Rubric alignment matrix: `backend/ai/engine.py`, `backend/routers/ai.py`
- Similarity warning threshold control: `backend/models.py`, `backend/routers/admin.py`
- AI-assisted suggested marks + feedback: `backend/ai/engine.py`
- Human-in-the-loop final grade publishing: `backend/routers/grading.py`, frontend review workflow
- Similarity distribution analytics: `backend/routers/enterprise_analytics.py`
- Rubric alignment analytics: `backend/routers/enterprise_analytics.py`
- UCI dataset status/metadata/acquisition controls: `backend/routers/analytics.py`
- CSV and PDF report export: `backend/routers/admin_reports.py`
- Resubmission policy + optional extension deadline: `backend/routers/resubmissions.py`
- Assignment deadline and late-submission enforcement: `backend/routers/submissions.py`
- Student submission history: frontend + `backend/routers/submissions.py`
- Teacher review queue: frontend + submissions APIs
- Dockerized backend/frontend development: `docker-compose.yml`
- CI configuration: `.github/workflows/ci.yml`

## Deliberate engineering choices

- AI suggestions do not automatically become final grades.
- The similarity engine is described as similarity screening, not a guaranteed plagiarism detector.
- Public UCI data is acquired by script; the application does not fabricate public-data records.
- Production cloud providers remain adapter targets; local Docker mode is the deterministic first-run environment.

## Validation note

Python syntax compilation was performed after the enterprise feature upgrade. Full dependency installation and browser build could not be completed in this isolated environment because external package/network access timed out. The repository therefore does not claim a false 100% runtime validation.
