import { NextResponse } from "next/server";
import { runExecutiveSummaryRuntime } from "@/lib/proposal-generation/executive-summary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runExecutiveSummaryRuntime({ deploymentId: "executive-summary-api" }));
}
