import { NextResponse } from "next/server";
import { runSeatRuntime } from "@/lib/enterprise-saas/seat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.5 Seat Runtime API — readonly GET. */
export async function GET() {
  return NextResponse.json(runSeatRuntime({ deploymentId: "seat-api" }));
}
