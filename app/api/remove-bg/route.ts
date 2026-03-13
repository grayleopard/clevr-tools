import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const BG_API_URL = process.env.BG_API_URL;
const BG_API_KEY = process.env.BG_API_KEY;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (existing.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - existing.count };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!BG_API_URL || !BG_API_KEY) {
    return NextResponse.json(
      { error: "Background removal is not configured yet." },
      { status: 503 }
    );
  }

  const key = getRateLimitKey(request);
  const { allowed, remaining } = checkRateLimit(key);

  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "You've used all 5 free removals today. Come back tomorrow, or upgrade to Pro for unlimited removals.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload JPG, PNG, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const backendForm = new FormData();
    backendForm.append("file", file);

    const response = await fetch(`${BG_API_URL}/remove-bg`, {
      method: "POST",
      headers: {
        "X-API-Key": BG_API_KEY,
        "X-Forwarded-For":
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
      },
      body: backendForm,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(async () => ({ detail: await response.text() }));
      return NextResponse.json(
        { error: errorBody.detail || errorBody.error || "Processing failed." },
        {
          status: response.status,
          headers: {
            "X-RateLimit-Limit": String(RATE_LIMIT),
            "X-RateLimit-Remaining": String(remaining),
          },
        }
      );
    }

    const resultBuffer = await response.arrayBuffer();

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "X-RateLimit-Limit": String(RATE_LIMIT),
        "X-RateLimit-Remaining": String(remaining),
        "X-Processing-Time": response.headers.get("X-Processing-Time") || "",
        "X-Original-Size": response.headers.get("X-Original-Size") || "",
        "X-Result-Size": response.headers.get("X-Result-Size") || "",
      },
    });
  } catch (error) {
    console.error(
      "Background removal proxy error:",
      error instanceof Error ? error.message : "unknown error"
    );
    return NextResponse.json(
      { error: "An error occurred during processing." },
      { status: 500 }
    );
  }
}
