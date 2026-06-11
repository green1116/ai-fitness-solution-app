import { NextResponse } from "next/server";
import { runModelSelectionRuntime } from "@/lib/equipment-selection/model-selection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runModelSelectionRuntime({ deploymentId: "model-selection-api", bidderBrand: "Technogym" }));
}
