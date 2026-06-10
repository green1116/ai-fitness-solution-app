import { NextResponse } from "next/server";
import { runProposalPdfDashboardRuntime } from "@/lib/proposal-pdf/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalPdfDashboardRuntime({ deploymentId: "dashboard-api" }));
}
