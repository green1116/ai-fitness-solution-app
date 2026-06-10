import { NextResponse } from "next/server";
import { runDeliveryRuntime } from "@/lib/autopilot/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runDeliveryRuntime({ deploymentId: "delivery-api" }));
}
