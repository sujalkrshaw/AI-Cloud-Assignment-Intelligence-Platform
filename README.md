# AI Cloud Assignment Intelligence Platform

An end-to-end AI-enabled cloud architecture for assignment submission, document intelligence, semantic similarity analysis, AI-assisted grading, and teacher feedback.

## What this project proves
- Full-stack React + FastAPI application
- JWT authentication and Student/Teacher RBAC
- Assignment CRUD and secure file upload/download
- SQL database persistence
- Private local object-storage adapter for deterministic development, with a documented cloud migration path
- NLP document analysis using TF-IDF + cosine similarity
- AI-assisted rubric scoring and feedback generation
- Similarity analysis across submissions
- Automated API and AI tests
- Docker Compose deployment
- CI workflow
- Seeded realistic academic demo data

The uploaded project specification calls for cloud database/object storage, authentication, role-based access, REST APIs, assignment management, submissions, grading, testing, security, scalability and deployment. This implementation adds the AI intelligence layer to that base. fileciteturn0file0L289-L345 

## Architecture
```text
React SPA -> FastAPI REST API -> SQL Database
                    |                 |
                    +-> Object Store +-> Submission metadata
                    |
                    +-> AI Engine
                        - text extraction
                        - TF-IDF vectors
                        - cosine similarity
                        - rubric scoring
                        - feedback generation
```

## AI is real, not a chatbot wrapper
The default AI engine runs locally and needs no API key. It uses TF-IDF document vectors and cosine similarity for semantic-ish textual similarity, plus a deterministic rubric-aware evaluation engine. Optional LLM feedback can be added later without changing the core workflow.

## Demo accounts
After seeding:
- Teacher: `teacher@demo.edu` / `Teacher@123`
- Student: `student1@demo.edu` / `Student@123`
- Student 2: `student2@demo.edu` / `Student@123`

These are dummy accounts for demonstration only.

## Requirements
- Windows 10/11, macOS or Linux
- Python 3.11+ (3.13 tested in the container)
- Node.js 20+
- Docker Desktop (recommended)

## Fastest installation (Docker)
```powershell
git clone <your-repository-url>
cd AI-Cloud-Assignment-Intelligence-Platform
Copy-Item .env.example .env
docker compose up --build
```
Open:
- Frontend: http://localhost:5173
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

The API container automatically initializes the database and demo data.

## Local installation without Docker
### Backend
```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..
Copy-Item .env.example .env
python -m backend.seed
uvicorn backend.main:app --reload --port 8000
```

### Frontend
In a second terminal:
```powershell
cd frontend
npm install
npm run dev
```

## Test everything
```powershell
cd backend
python -m pytest -q
cd ..\frontend
npm run build
```

## Main workflow
1. Teacher logs in and creates an assignment with a rubric.
2. Student logs in and views the assignment.
3. Student uploads a PDF/TXT/DOCX file.
4. API validates file type and size and stores it.
5. AI pipeline extracts text and calculates document metrics.
6. Similarity engine compares the submission against other submissions for the assignment.
7. Teacher opens the review queue.
8. AI suggests rubric scores and feedback.
9. Teacher edits/approves the final marks and feedback.
10. Student sees final feedback and performance metrics.

## Security controls
- Password hashing with bcrypt
- JWT access tokens
- Role checks on every protected route
- Ownership checks for student resources
- File extension and MIME checks
- File size limits
- Path traversal protection
- CORS allow-list
- Secrets through environment variables
- No credentials committed

## Cloud path
The application uses service interfaces so local development is reliable while cloud deployment remains straightforward. Supabase can provide managed Postgres, Auth and Storage. Configure the cloud adapter only when you are ready to deploy.

## Production checklist
- Replace demo credentials
- Use HTTPS
- Set a strong `JWT_SECRET`
- Use managed PostgreSQL
- Use private object storage + signed URLs
- Add rate limiting at the edge/API gateway
- Add malware scanning before accepting files in production
- Add centralized logs/metrics
- Configure backups and alerting

## Project structure
```text
AI-Cloud-Assignment-Intelligence-Platform/
├── backend/
│   ├── ai/
│   ├── core/
│   ├── routers/
│   ├── tests/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── schemas.py
│   ├── seed.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── sample_assignments.json
│   └── academic_demo_data.csv
├── sample_files/
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── deployment.md
├── screenshots/.gitkeep
├── .github/workflows/ci.yml
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Honest project positioning
This is an AI-assisted academic workflow platform. Similarity scores are signals for teacher review, not proof of plagiarism. AI-generated grades are suggestions; the teacher remains the final decision-maker.

## Real public dataset
For recruiter-facing ML/analytics proof, the repository includes a downloader for the public UCI Student Performance dataset. UCI describes it as 649 instances collected from two Portuguese schools and licenses it CC BY 4.0. See the official dataset page: https://archive.ics.uci.edu/dataset/320/student%2Bperformance The project keeps this acquisition optional so the core demo never depends on an external download.

Run:
```powershell
python scripts/download_uci_student_performance.py
```

## UI and visual assets

The dashboard is designed as a modern SaaS analytics workspace with a persistent sidebar, KPI cards, workflow pipeline, AI review queue, analytics panels and responsive layouts. A real office/analytics photograph from Unsplash is used when online, with the included local image as a fallback. Source: https://unsplash.com/photos/someone-works-at-their-computer-with-a-mouse-ZXh3zbw1oHc

See `docs/ui.md` for the asset/license note and visual design details.

## Enterprise governance features

The platform also includes a dedicated administrator control plane:

- Admin user governance: promote/demote roles and activate/deactivate accounts.
- Audit logs for authentication, RBAC denials, AI analysis, submissions, grade publication and policy changes.
- Course and batch management.
- AI policy controls for similarity warning and relevance thresholds.
- Similarity distribution analytics and rubric-alignment analytics.
- CSV/PDF submission reporting.
- Resubmission policy controls, including optional extension deadlines.
- UCI dataset metadata inspection and administrator-triggered acquisition.

### Admin demo account

```text
Email: admin@demo.edu
Password: Admin@123
```

Change all demo credentials in `.env` before any non-local deployment.

See `FEATURE_AUDIT.md` for a direct implementation-to-requirement mapping.


## Real Public Data Sources

The analytics layer uses public, verifiable datasets and keeps them separate from
platform users, assignments, submissions, and grades.

### 1. UCI Student Performance

- Source: UCI Machine Learning Repository
- Dataset ID: 320
- Mathematics: 395 records
- Portuguese: 649 records
- License: CC BY 4.0
- Acquisition script: `scripts/download_uci_student_performance.py`

### 2. UK Department for Education — Pupil Attendance

- Source: UK Department for Education, Explore Education Statistics
- Dataset ID: `c0be1b5f-4240-4f99-ba80-70be8916c5ef`
- Release: Week 37 2026 (Start of 26/27 AY)
- Published: 24 September 2026
- Data period: week commencing 07 September 2026
- Dataset: weekly pupil attendance
- Acquisition script: `scripts/download_dfe_pupil_attendance.py`

The DfE integration downloads the official CSV from the source endpoint and records
the actual local acquisition timestamp in `data/real/public/dfe_attendance/metadata.json`.
The application does **not** fabricate historical observations or backdate downloads.

Run from the project root:

```powershell
python scripts/download_dfe_pupil_attendance.py
```

Or, after the backend is running, an administrator can acquire it through:

```text
POST /api/analytics/public/dfe-attendance/acquire
```

Read-only analytics are available at:

```text
GET /api/analytics/public/dfe-attendance
```

Official source:
https://explore-education-statistics.service.gov.uk/data-catalogue/data-set/c0be1b5f-4240-4f99-ba80-70be8916c5ef

**Data provenance rule:** public research/statistical data is never represented as
live institutional student records. Demo platform accounts and seed workflow data
remain clearly separated from public-data analytics.
