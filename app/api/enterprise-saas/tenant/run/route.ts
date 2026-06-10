import { NextResponse } from "next/server";
import { runTenantRuntime } from "@/lib/enterprise-saas/tenant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.5 Tenant Runtime API — readonly GET. */
export async function GET() {
  return NextResponse.json(runTenantRuntime({ deploymentId: "tenant-api" }));
}
