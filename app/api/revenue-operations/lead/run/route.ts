import { NextResponse } from "next/server";
import { runLeadRuntime } from "@/lib/revenue-operations/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runLeadRuntime({ deploymentId: "lead-api" }));
}
