import { NextResponse } from "next/server";
import { runChurnRuntime } from "@/lib/revenue-operations/churn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runChurnRuntime({ deploymentId: "churn-api" }));
}
