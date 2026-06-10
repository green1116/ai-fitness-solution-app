import { NextResponse } from "next/server";
import { runHumanReviewRuntime } from "@/lib/autopilot/human-review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runHumanReviewRuntime({ deploymentId: "review-api" }));
}
