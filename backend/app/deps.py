from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import settings

# Sync psycopg: avoids the Windows ProactorEventLoop incompatibility of async
# psycopg and asyncpg's prepared-statement issues behind Neon's PgBouncer
# pooler. FastAPI runs these handlers in a threadpool.
url = settings.database_url.replace("postgresql+asyncpg://", "postgresql+psycopg://")

engine = create_engine(url, connect_args={"prepare_threshold": None}, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
