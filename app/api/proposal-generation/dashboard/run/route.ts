import { NextResponse } from "next/server";
import { runProposalDashboardRuntime } from "@/lib/proposal-generation/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalDashboardRuntime({ deploymentId: "dashboard-api" }));
}
