from io import BytesIO
import os
import secrets
import time

from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image, UnidentifiedImageError
from rembg import new_session, remove

APP_NAME = "clevr.tools Background Remover API"
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_DIMENSION = int(os.getenv("MAX_DIMENSION", "4096"))
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
API_KEY = os.getenv("BG_API_KEY", "")
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "https://www.clevr.tools")
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
RATE_WINDOW_SECONDS = 60
rate_limit_store: dict[str, dict[str, float | int]] = {}

app = FastAPI(title=APP_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "X-API-Key"],
)

session = new_session("birefnet-general")


def check_rate_limit(client_key: str) -> None:
    now = time.time()
    record = rate_limit_store.get(client_key)

    if record is None or now > float(record["reset_at"]):
        rate_limit_store[client_key] = {"count": 1, "reset_at": now + RATE_WINDOW_SECONDS}
        return

    if int(record["count"]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

    record["count"] = int(record["count"]) + 1


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.post("/remove-bg")
async def remove_background(
    file: UploadFile = File(...),
    x_api_key: str | None = Header(default=None),
    x_forwarded_for: str | None = Header(default=None),
):
    if not API_KEY:
        raise HTTPException(status_code=503, detail="BG_API_KEY is not configured on the server.")

    if not x_api_key or not secrets.compare_digest(x_api_key, API_KEY):
        raise HTTPException(status_code=401, detail="Unauthorized")

    client_key = (x_forwarded_for or "unknown").split(",")[0].strip()
    check_rate_limit(client_key)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload JPG, PNG, or WebP.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    try:
        image = Image.open(BytesIO(image_bytes))
        width, height = image.size
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    if width > MAX_DIMENSION or height > MAX_DIMENSION:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum dimension is {MAX_DIMENSION}px.",
        )

    start = time.time()
    result_bytes = remove(image_bytes, session=session)
    processing_time = time.time() - start

    return StreamingResponse(
        BytesIO(result_bytes),
        media_type="image/png",
        headers={
            "X-Processing-Time": f"{processing_time:.2f}s",
            "X-Original-Size": str(len(image_bytes)),
            "X-Result-Size": str(len(result_bytes)),
        },
    )
