from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..deps import get_db
from ..models import Inquiry, User
from ..schemas import AuthOut, InquiryIn, InquiryOut, LoginIn, RegisterIn, UserOut
from ..security import authenticate, create_token, get_current_user, hash_password

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/auth/register", status_code=201)
def register(data: RegisterIn, db: Session = Depends(get_db)) -> AuthOut:
    existing = db.scalar(select(User).where(User.email == data.email.lower()))
    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "That email is already registered.",
                "fieldErrors": {"email": "That email is already registered."},
            },
        )
    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        phone=data.phone,
        role="CUSTOMER",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthOut(token=create_token(user), user={"id": user.id, "role": user.role})


@router.post("/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)) -> AuthOut:
    user = authenticate(db, data.email, data.password)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail={"message": "Email or password is incorrect."},
        )
    return AuthOut(token=create_token(user), user={"id": user.id, "role": user.role})


@router.get("/auth/me")
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        passwordHash=user.password_hash,
        phone=user.phone,
        role=user.role,
        createdAt=user.created_at,
    )


# Inquiries are submitted anonymously, so they ride along here rather than in
# an admin-only module.
@router.post("/inquiries")
def submit_inquiry(data: InquiryIn, db: Session = Depends(get_db)) -> dict:
    inquiry = Inquiry(
        type=data.type,
        name=data.name.strip(),
        phone=data.phone.strip(),
        email=data.email,
        device=data.device,
        condition=data.condition,
        message=data.message,
    )
    db.add(inquiry)
    db.commit()
    return {"ok": True, "message": "Thanks! We'll get back to you shortly."}
