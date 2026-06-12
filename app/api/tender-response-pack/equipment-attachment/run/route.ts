import { NextResponse } from "next/server";
import { runEquipmentAttachmentRuntime } from "@/lib/tender-response-pack/equipment-attachment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentAttachmentRuntime({ deploymentId: "equipment-attachment-api" }));
}
