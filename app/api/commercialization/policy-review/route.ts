import { NextResponse } from "next/server";
import { buildPolicyReview } from "@/lib/commercialization/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H10 Policy Review API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const review = buildPolicyReview({ deploymentId: "policy-review-api" });
  return NextResponse.json(review);
}
