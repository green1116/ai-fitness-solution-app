import { NextResponse } from "next/server";
import { runEquipmentIntelligenceRuntime } from "@/lib/tender-intelligence/equipment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentIntelligenceRuntime({ deploymentId: "equipment-api" }));
}
