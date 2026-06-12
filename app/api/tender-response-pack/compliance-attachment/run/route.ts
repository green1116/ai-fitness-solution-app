import { NextResponse } from "next/server";
import { runComplianceAttachmentRuntime } from "@/lib/tender-response-pack/compliance-attachment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runComplianceAttachmentRuntime({ deploymentId: "compliance-attachment-api" }));
}
