import { NextResponse } from "next/server";
import { runDeliveryScheduleRuntime } from "@/lib/proposal-generation/delivery-schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runDeliveryScheduleRuntime({ deploymentId: "delivery-schedule-api" }));
}
