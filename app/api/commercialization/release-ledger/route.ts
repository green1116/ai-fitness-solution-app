import { NextResponse } from "next/server";
import { buildReleaseLedger } from "@/lib/commercialization/release-ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V3.7-H7 Release Ledger API — readonly GET surface.
 * Static aggregation only; no writes, no runtime execution.
 */
export async function GET() {
  const ledger = buildReleaseLedger({ deploymentId: "release-ledger-api" });
  return NextResponse.json(ledger);
}
