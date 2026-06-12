import { NextResponse } from "next/server";
import { runEquipmentStrategyRuntime } from "@/lib/proposal-differentiation/equipment-strategy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentStrategyRuntime({ deploymentId: "equipment-strategy-api", bidderBrand: "Technogym" }));
}
