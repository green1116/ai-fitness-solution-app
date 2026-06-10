import { NextResponse } from "next/server";
import { runCustomerRuntime } from "@/lib/revenue-operations/customer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCustomerRuntime({ deploymentId: "customer-api" }));
}
