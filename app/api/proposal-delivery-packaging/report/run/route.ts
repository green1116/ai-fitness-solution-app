import { NextResponse } from "next/server";
import { buildProposalDeliveryPackagingReport } from "@/lib/proposal-delivery-packaging/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildProposalDeliveryPackagingReport({ deploymentId: "proposal-delivery-packaging-report-api" }));
}
