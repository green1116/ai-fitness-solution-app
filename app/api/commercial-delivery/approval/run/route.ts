import { NextResponse } from "next/server";
import { runApprovalRuntime } from "@/lib/commercial-delivery/approval";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runApprovalRuntime({ deploymentId: "approval-api" }));
}
