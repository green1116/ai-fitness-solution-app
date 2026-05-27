import { NextResponse } from "next/server";
import { buildAuditReviewSurface } from "@/lib/commercialization/audit/audit-review-surface";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H5 Production Audit API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const surface = buildAuditReviewSurface({ deploymentId: "audit-api" });
  return NextResponse.json(surface);
}
