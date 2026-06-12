import { NextResponse } from "next/server";
import { runMaintenanceNarrativeRuntime } from "@/lib/proposal-delivery-packaging/maintenance-narrative";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runMaintenanceNarrativeRuntime({ deploymentId: "maintenance-narrative-api" }));
}
