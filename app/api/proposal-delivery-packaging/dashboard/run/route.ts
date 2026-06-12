import { NextResponse } from "next/server";
import { runProposalPackagingDashboardRuntime } from "@/lib/proposal-delivery-packaging/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalPackagingDashboardRuntime({ deploymentId: "proposal-packaging-dashboard-api" }));
}
