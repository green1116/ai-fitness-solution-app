import { NextResponse } from "next/server";
import { runPermissionRuntime } from "@/lib/enterprise-saas/permission";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** V10.5 Permission Runtime API — readonly GET. */
export async function GET() {
  return NextResponse.json(runPermissionRuntime({ deploymentId: "permission-api" }));
}
