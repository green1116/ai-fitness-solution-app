import { NextResponse } from "next/server";
import { runCustomerHealthRuntime } from "@/lib/customer-success/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCustomerHealthRuntime({ deploymentId: "health-api" }));
}
