import { NextResponse } from "next/server";
import { runDifferentiationDashboardRuntime } from "@/lib/proposal-differentiation/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runDifferentiationDashboardRuntime({ deploymentId: "differentiation-dashboard-api" }));
}
