import { NextResponse } from "next/server";
import { runDeliveryReadinessRuntime } from "@/lib/proposal-delivery-packaging/delivery-readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runDeliveryReadinessRuntime({ deploymentId: "delivery-readiness-api" }));
}
