import { NextResponse } from "next/server";
import { runEquipmentPackageRuntime } from "@/lib/equipment-selection/equipment-package";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentPackageRuntime({ deploymentId: "equipment-package-api", bidderBrand: "Technogym" }));
}
