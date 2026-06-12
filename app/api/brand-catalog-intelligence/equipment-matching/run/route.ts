import { NextResponse } from "next/server";
import { runEquipmentMatchingRuntime } from "@/lib/brand-catalog-intelligence/equipment-matching";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentMatchingRuntime({ deploymentId: "equipment-matching-api" }));
}
