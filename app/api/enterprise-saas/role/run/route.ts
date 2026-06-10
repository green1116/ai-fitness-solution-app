import { NextResponse } from "next/server";
import { runRoleRuntime } from "@/lib/enterprise-saas/role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.5 Role Runtime API — readonly GET. */
export async function GET() {
  return NextResponse.json(runRoleRuntime({ deploymentId: "role-api" }));
}
