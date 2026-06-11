import { NextResponse } from "next/server";
import { runEquipmentPlanComposerRuntime } from "@/lib/bidder-proposal-composer/equipment-plan-composer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEquipmentPlanComposerRuntime({ deploymentId: "equipment-plan-composer-api" }));
}
