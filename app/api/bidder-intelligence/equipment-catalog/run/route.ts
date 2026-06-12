import { NextResponse } from "next/server";
import { runEquipmentCatalogRuntime } from "@/lib/bidder-intelligence/equipment-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentCatalogRuntime({ deploymentId: "equipment-catalog-api" }));
}
