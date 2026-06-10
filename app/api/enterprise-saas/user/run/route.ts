import { NextResponse } from "next/server";
import { runUserRuntime } from "@/lib/enterprise-saas/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.5 User Runtime API — readonly GET. */
export async function GET() {
  return NextResponse.json(runUserRuntime({ deploymentId: "user-api" }));
}
