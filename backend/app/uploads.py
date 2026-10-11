"""Storage for uploaded images.

Lives on its own so both the admin product-photo route and the public
payment-proof route can share it — the two routers import from each other for
order serialisation, and a shared helper between them would close that loop.
"""

import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile


# Files land here and are served by the /uploads static mount in main.py.
# Vercel's serverless filesystem is read-only outside /tmp, so the deployment
# keeps its uploads there (per-instance and ephemeral — see main.py).
def _default_upload_dir() -> Path:
    if os.environ.get("UPLOAD_DIR"):
        return Path(os.environ["UPLOAD_DIR"])
    if os.environ.get("VERCEL"):
        return Path("/tmp/uploads")
    return Path(__file__).resolve().parents[1] / "uploads"


UPLOAD_DIR = _default_upload_dir()

# The extension is taken from the content type, never from the filename, so a
# renamed .html can't be stored as an image.
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
}
MAX_IMAGE_BYTES = 25 * 1024 * 1024


async def save_image(file: UploadFile) -> dict:
    """Validates and stores one image, returning its public path.

    Shared by the admin product-photo route and the public payment-proof route,
    so both enforce the same type and size rules.
    """
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    extension = ALLOWED_IMAGE_TYPES.get(content_type)
    if extension is None:
        raise HTTPException(
            status_code=400,
            detail={"message": "That file type isn't supported — use a JPG, PNG, WebP or GIF."},
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail={"message": "That file is empty."})
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail={"message": "Images must be smaller than 25 MB. Resize it and try again."},
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{extension}"
    (UPLOAD_DIR / name).write_bytes(data)
    # Stored as a path, not a URL: the frontend rewrites /uploads/* to the API
    # host, so moving the API never breaks the images already in the database.
    return {"url": f"/uploads/{name}", "contentType": content_type}