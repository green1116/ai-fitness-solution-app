import { NextResponse } from "next/server";
import { runSupplierCapabilityRuntime } from "@/lib/bidder-intelligence/supplier-capability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runSupplierCapabilityRuntime({ deploymentId: "supplier-capability-api" }));
}
