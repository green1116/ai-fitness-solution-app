import { NextResponse } from "next/server";
import { runEquipmentSelectionDashboardRuntime } from "@/lib/equipment-selection/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentSelectionDashboardRuntime({ deploymentId: "equipment-selection-dashboard-api" }));
}
