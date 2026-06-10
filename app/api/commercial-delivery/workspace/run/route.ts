import { NextResponse } from "next/server";
import { runDeliveryWorkspaceRuntime } from "@/lib/commercial-delivery/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runDeliveryWorkspaceRuntime({ deploymentId: "workspace-api" }));
}
