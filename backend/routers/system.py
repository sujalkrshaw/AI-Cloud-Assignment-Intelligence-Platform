from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy import text
from ..database import get_db
from ..config import settings
from ..core.deps import require_role

router=APIRouter(prefix="/system",tags=["System"])

@router.get("/status")
def status(db=Depends(get_db), user=Depends(require_role("student","teacher","admin"))):
    try:
        db.execute(text("SELECT 1")); db_status="operational"
    except Exception: db_status="degraded"
    p=Path(settings.upload_dir); p.mkdir(parents=True,exist_ok=True)
    storage_status="operational" if p.exists() and p.is_dir() else "degraded"
    return {"database":db_status,"object_storage":storage_status,"ai_engine":"operational","api":"operational"}
