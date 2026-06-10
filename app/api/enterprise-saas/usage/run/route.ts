import { NextResponse } from "next/server";
import { runUsageRuntime } from "@/lib/enterprise-saas/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.5 Usage Runtime API — readonly GET. */
export async function GET() {
  return NextResponse.json(runUsageRuntime({ deploymentId: "usage-api" }));
}
