import { NextResponse } from "next/server";
import { runEquipmentIntelligenceRuntime } from "@/lib/brand-catalog-intelligence/equipment-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentIntelligenceRuntime({ deploymentId: "equipment-intelligence-api" }));
}
