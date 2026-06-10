import { NextResponse } from "next/server";
import { runComplianceMatrixRuntime } from "@/lib/proposal-generation/compliance-matrix";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runComplianceMatrixRuntime({ deploymentId: "compliance-matrix-api" }));
}
