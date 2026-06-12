import { NextResponse } from "next/server";
import { runLifecycleCostRuntime } from "@/lib/proposal-delivery-packaging/lifecycle-cost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runLifecycleCostRuntime({ deploymentId: "lifecycle-cost-api" }));
}
