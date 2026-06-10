import { NextResponse } from "next/server";
import { runRevenueOpsDashboardRuntime } from "@/lib/revenue-operations/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runRevenueOpsDashboardRuntime({ deploymentId: "dashboard-api" }));
}
