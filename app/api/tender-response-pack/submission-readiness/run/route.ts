import { NextResponse } from "next/server";
import { runSubmissionReadinessRuntime } from "@/lib/tender-response-pack/submission-readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runSubmissionReadinessRuntime({ deploymentId: "submission-readiness-api" }));
}
