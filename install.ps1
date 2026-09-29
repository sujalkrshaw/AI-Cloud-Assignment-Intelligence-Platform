$ErrorActionPreference = "Stop"
Write-Host "AI Cloud Assignment Intelligence Platform - Windows setup" -ForegroundColor Cyan
if (!(Get-Command py -ErrorAction SilentlyContinue)) { throw "Python launcher 'py' not found. Install Python 3.13+ and retry." }
if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js not found. Install Node.js 20+ and retry." }
Copy-Item .env.example .env -Force
py -3 -m venv backend/.venv
& backend/.venv/Scripts/python.exe -m pip install --upgrade pip
& backend/.venv/Scripts/pip.exe install -r backend/requirements.txt
Push-Location frontend; npm install; Pop-Location
& backend/.venv/Scripts/python.exe -m backend.seed
Write-Host "Setup complete. Start backend: backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000" -ForegroundColor Green
Write-Host "Start frontend in another terminal: cd frontend; npm run dev" -ForegroundColor Green
