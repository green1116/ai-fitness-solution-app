import { NextResponse } from "next/server";
import { runEquipmentKnowledgeRuntime } from "@/lib/knowledge-base/equipment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentKnowledgeRuntime({ deploymentId: "equipment-api" }));
}
