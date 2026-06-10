import { NextResponse } from "next/server";
import { runEnterpriseDashboardRuntime } from "@/lib/enterprise-saas/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.5 Enterprise Dashboard Runtime API — readonly GET. */
export async function GET() {
  return NextResponse.json(
    runEnterpriseDashboardRuntime({ deploymentId: "dashboard-api" }),
  );
}
