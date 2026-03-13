# clevr-bg-api

FastAPI + rembg backend for `https://www.clevr.tools/tools/background-remover`.

## Environment

- `BG_API_KEY` — shared secret expected from the Next.js proxy route
- `ALLOWED_ORIGIN` — allowed browser origin for CORS, defaults to `https://www.clevr.tools`
- `MAX_DIMENSION` — maximum allowed image width or height, defaults to `4096`
- `RATE_LIMIT_PER_MINUTE` — backend throttle for proxied requests, defaults to `30`
- `UVICORN_WORKERS` — defaults to `1`; increase only if the VPS has enough RAM for multiple model copies

## Local run

```bash
pip install -r requirements.txt
export BG_API_KEY="$(openssl rand -hex 32)"
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
```

## Docker run

```bash
docker compose up -d --build
```

## Reverse proxy

Point `bg.clevr.tools` at the VPS and proxy HTTPS traffic to `localhost:8000` with Caddy or Nginx.
The Vercel app should call this backend through the Next.js proxy route using:

- `BG_API_URL=https://bg.clevr.tools`
- `BG_API_KEY=<same shared secret as the backend>`
```
