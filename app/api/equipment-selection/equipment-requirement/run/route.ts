import { NextResponse } from "next/server";
import { runEquipmentRequirementRuntime } from "@/lib/equipment-selection/equipment-requirement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentRequirementRuntime({ deploymentId: "equipment-requirement-api" }));
}
