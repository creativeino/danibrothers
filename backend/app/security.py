from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .deps import get_db
from .models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

bearer = HTTPBearer(auto_error=False)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def create_token(user: User) -> str:
    # Same claims the frontend's `verifySessionToken` reads back.
    from datetime import datetime, timedelta, timezone

    payload = {
        "sub": user.id,
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.token_expire_minutes),
    }
    return jwt.encode(payload, settings.auth_secret, algorithm=settings.access_token_algorithm)


def _credentials_error(detail: str = "Could not validate credentials") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"message": detail},
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise _credentials_error("You need to sign in first.")
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.auth_secret,
            algorithms=[settings.access_token_algorithm],
        )
    except JWTError:
        raise _credentials_error("Your session has expired. Please sign in again.")
    user_id = payload.get("id") or payload.get("sub")
    if not user_id:
        raise _credentials_error()
    user = db.get(User, user_id)
    if user is None:
        raise _credentials_error("This account no longer exists.")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "You don't have permission to do that."},
        )
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user
