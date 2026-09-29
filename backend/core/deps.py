from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserAdminState
from .security import decode_token

bearer = HTTPBearer()

def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(credentials.credentials)
        user = db.get(User, int(payload["sub"]))
    except Exception:
        user = None
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    state = db.query(UserAdminState).filter_by(user_id=user.id).first()
    if state and not state.active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    return user

def require_role(*roles):
    def checker(user: User = Depends(current_user)):
        if user.role not in roles:
            from .audit import log_event
            try:
                from ..database import SessionLocal
                audit_db=SessionLocal()
                try: log_event(audit_db, user.id, "RBAC_DENIED", "route", severity="WARNING", details={"required_roles":roles,"actual_role":user.role})
                finally: audit_db.close()
            except Exception: pass
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker
