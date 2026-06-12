import { NextResponse } from "next/server";
import { buildEquipmentSelectionReport } from "@/lib/equipment-selection/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildEquipmentSelectionReport({ deploymentId: "report-api" }));
}
