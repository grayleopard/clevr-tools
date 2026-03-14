from __future__ import annotations

import asyncio
import logging
import os
import secrets
import time
from io import BytesIO

from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.concurrency import run_in_threadpool
from PIL import Image, UnidentifiedImageError
from rembg import new_session, remove

APP_NAME = "clevr.tools Background Remover API"
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_BYTES", str(10 * 1024 * 1024)))
MAX_DIMENSION = int(os.getenv("MAX_DIMENSION", "4096"))
PROCESSING_TIMEOUT_SECONDS = int(os.getenv("PROCESSING_TIMEOUT_SECONDS", "45"))
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
API_KEY = os.getenv("BG_API_KEY", "")
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "https://www.clevr.tools")
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
RATE_WINDOW_SECONDS = 60
PROBE_PATH_FRAGMENTS = (
    "/.env",
    "/.git/",
    "/.aws/",
    "/wp-login.php",
    "/swagger",
    "/docker-compose",
    "/storage/logs/",
    "/stripe.json",
    "/config/",
)

rate_limit_store: dict[str, dict[str, float | int]] = {}

logger = logging.getLogger("bg_api")


class ProbeAccessFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        args = record.args
        if not isinstance(args, tuple) or len(args) < 5:
            return True

        path = str(args[2]).lower()
        status_code = str(args[4])
        if status_code == "404" and any(fragment in path for fragment in PROBE_PATH_FRAGMENTS):
            return False
        return True


access_logger = logging.getLogger("uvicorn.access")
if not any(isinstance(current_filter, ProbeAccessFilter) for current_filter in access_logger.filters):
    access_logger.addFilter(ProbeAccessFilter())


app = FastAPI(title=APP_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "X-API-Key"],
)

session = new_session("birefnet-general")


def get_client_key(request: Request, forwarded_for: str | None = None) -> str:
    if forwarded_for:
        return forwarded_for.split(",")[0].strip() or "unknown"
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def log_remove_bg(level: int, reason: str, **fields: object) -> None:
    payload = " ".join(f"{key}={value}" for key, value in fields.items() if value is not None)
    suffix = f" {payload}" if payload else ""
    logger.log(level, "remove-bg %s%s", reason, suffix)


def check_rate_limit(client_key: str) -> None:
    now = time.time()
    record = rate_limit_store.get(client_key)

    if record is None or now > float(record["reset_at"]):
        rate_limit_store[client_key] = {"count": 1, "reset_at": now + RATE_WINDOW_SECONDS}
        return

    if int(record["count"]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests.")

    record["count"] = int(record["count"]) + 1


@app.middleware("http")
async def enforce_upload_guards(request: Request, call_next):
    if request.url.path == "/remove-bg":
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                declared_size = int(content_length)
            except ValueError:
                return JSONResponse(status_code=400, content={"detail": "Invalid request."})

            if declared_size > MAX_FILE_SIZE:
                log_remove_bg(logging.INFO, "rejected:request_too_large", declared_size=declared_size)
                return JSONResponse(
                    status_code=413,
                    content={"detail": f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB."},
                )

    return await call_next(request)


@app.get("/")
async def root() -> dict[str, object]:
    return {"ok": True, "service": "bg-api"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.post("/remove-bg")
async def remove_background(
    request: Request,
    file: UploadFile | None = File(default=None),
    x_api_key: str | None = Header(default=None),
    x_forwarded_for: str | None = Header(default=None),
):
    client_key = get_client_key(request, x_forwarded_for)

    if not API_KEY:
        log_remove_bg(logging.ERROR, "failed:missing_api_key_env")
        raise HTTPException(status_code=503, detail="Service unavailable.")

    if not x_api_key or not secrets.compare_digest(x_api_key, API_KEY):
        log_remove_bg(logging.WARNING, "rejected:unauthorized", client=client_key)
        raise HTTPException(status_code=401, detail="Unauthorized.")

    try:
        check_rate_limit(client_key)
    except HTTPException:
        log_remove_bg(logging.WARNING, "rejected:rate_limited", client=client_key)
        raise

    if file is None:
        log_remove_bg(logging.INFO, "rejected:missing_file", client=client_key)
        raise HTTPException(status_code=400, detail="No file provided.")

    if file.content_type not in ALLOWED_TYPES:
        log_remove_bg(
            logging.INFO,
            "rejected:invalid_content_type",
            client=client_key,
            content_type=file.content_type or "unknown",
        )
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    image_bytes = await file.read()
    if not image_bytes:
        log_remove_bg(logging.INFO, "rejected:empty_file", client=client_key)
        raise HTTPException(status_code=400, detail="Empty file.")

    if len(image_bytes) > MAX_FILE_SIZE:
        log_remove_bg(
            logging.INFO,
            "rejected:file_too_large",
            client=client_key,
            bytes=len(image_bytes),
        )
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB.",
        )

    try:
        image = Image.open(BytesIO(image_bytes))
        width, height = image.size
        image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        log_remove_bg(logging.INFO, "rejected:invalid_image", client=client_key)
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    if width > MAX_DIMENSION or height > MAX_DIMENSION:
        log_remove_bg(
            logging.INFO,
            "rejected:dimension_limit",
            client=client_key,
            width=width,
            height=height,
        )
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum dimension is {MAX_DIMENSION}px.",
        )

    start = time.time()
    try:
        result_bytes = await asyncio.wait_for(
            run_in_threadpool(remove, image_bytes, session=session),
            timeout=PROCESSING_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError as exc:
        log_remove_bg(logging.ERROR, "failed:processing_timeout", client=client_key)
        raise HTTPException(status_code=504, detail="Processing timed out.") from exc
    except Exception as exc:
        log_remove_bg(logging.ERROR, "failed:processing_error", client=client_key)
        raise HTTPException(status_code=500, detail="Processing failed.") from exc

    processing_time = time.time() - start
    log_remove_bg(
        logging.INFO,
        "success",
        client=client_key,
        duration_ms=int(processing_time * 1000),
        input_bytes=len(image_bytes),
        output_bytes=len(result_bytes),
    )

    return StreamingResponse(
        BytesIO(result_bytes),
        media_type="image/png",
        headers={
            "X-Processing-Time": f"{processing_time:.2f}s",
            "X-Original-Size": str(len(image_bytes)),
            "X-Result-Size": str(len(result_bytes)),
        },
    )
