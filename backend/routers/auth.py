from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserAdminState
from ..core.audit import log_event
from ..schemas import RegisterRequest, LoginRequest, TokenResponse
from ..core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(409, "Email already registered")
    if payload.role == "admin":
        raise HTTPException(403, "Admin accounts are provisioned by platform administrators")
    user = User(name=payload.name.strip(), email=payload.email.lower(), password_hash=hash_password(payload.password), role=payload.role)
    db.add(user); db.commit(); db.refresh(user)
    db.add(UserAdminState(user_id=user.id, active=True)); db.commit(); log_event(db,user.id,"USER_REGISTERED","user",user.id)
    log_event(db,user.id,"LOGIN_SUCCESS","auth",user.id)
    return {"access_token": create_access_token(user.id, user.role), "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        if user: log_event(db,user.id,"LOGIN_FAILED","auth",user.id,"WARNING")
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": create_access_token(user.id, user.role), "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}
