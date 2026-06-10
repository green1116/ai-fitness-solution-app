import { NextResponse } from "next/server";
import { runCustomerPortalRuntime } from "@/lib/commercial-delivery/customer-portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCustomerPortalRuntime({ deploymentId: "portal-api" }));
}
