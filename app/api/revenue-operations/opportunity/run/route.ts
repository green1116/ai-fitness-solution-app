import { NextResponse } from "next/server";
import { runOpportunityRuntime } from "@/lib/revenue-operations/opportunity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runOpportunityRuntime({ deploymentId: "opportunity-api" }));
}
