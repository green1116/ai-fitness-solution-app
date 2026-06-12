import { NextResponse } from "next/server";
import { runEquipmentDifferentiationRuntime } from "@/lib/equipment-selection/equipment-differentiation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentDifferentiationRuntime({ deploymentId: "equipment-differentiation-api" }));
}
