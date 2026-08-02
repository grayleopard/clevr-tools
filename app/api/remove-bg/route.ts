import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Background Remover is contained until its processor and data-handling
 * contract are independently approved. Deployment secrets must not be able to
 * reactivate the public proxy while the product surface is disabled.
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Background removal is currently unavailable." },
    { status: 503 }
  );
}
