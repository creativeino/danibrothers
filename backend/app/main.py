from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .routers import admin, auth, catalog, orders
from .uploads import UPLOAD_DIR

app = FastAPI(title="Dani Brothers API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Product photos uploaded from the admin panel. The directory is created here
# so the mount never fails on a fresh checkout that has no uploads yet.
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(catalog.router)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health() -> dict:
    return {"ok": True}
