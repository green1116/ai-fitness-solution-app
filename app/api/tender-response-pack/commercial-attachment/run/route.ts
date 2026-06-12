import { NextResponse } from "next/server";
import { runCommercialAttachmentRuntime } from "@/lib/tender-response-pack/commercial-attachment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCommercialAttachmentRuntime({ deploymentId: "commercial-attachment-api" }));
}
