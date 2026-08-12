import { NextResponse } from "next/server";
import { getOperationsSurface } from "@/lib/commercial/operations-surface";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ESOS-2 Operations Surface API — readonly GET.
 * Returns existing ESOS-1 OperationsSurface only; no writes, no execution.
 */
export async function GET() {
  return NextResponse.json(getOperationsSurface());
}
