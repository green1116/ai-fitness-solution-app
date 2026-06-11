import { NextResponse } from "next/server";
import { runLeadAcquisitionRuntime } from "@/lib/go-to-market/lead-acquisition";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runLeadAcquisitionRuntime({ deploymentId: "lead-acq-api" }));
}
