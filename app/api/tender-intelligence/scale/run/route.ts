import { NextResponse } from "next/server";
import { runProjectScaleRuntime } from "@/lib/tender-intelligence/scale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProjectScaleRuntime({ deploymentId: "scale-api" }));
}
