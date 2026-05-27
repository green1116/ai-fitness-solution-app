import { NextResponse } from "next/server";
import { buildEvidenceExport } from "@/lib/commercialization/release-ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H7 Evidence Export API — readonly GET surface.
 * Static export structure only; no file IO, no zip, no runtime execution.
 */
export async function GET() {
  const evidence = buildEvidenceExport({ deploymentId: "evidence-export-api" });
  return NextResponse.json(evidence);
}
