import { NextResponse } from "next/server";
import type { XRayError } from "@/lib/xray/types";

export const runtime = "nodejs";

/**
 * File X-Ray sends extracted document content to an external AI processor.
 * Keep the route unavailable until the processor, retention, training, and
 * handling terms are verified and the UI can obtain explicit informed consent.
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "File X-Ray is currently unavailable.",
      code: "UNAVAILABLE",
    } satisfies XRayError,
    { status: 503 }
  );
}
