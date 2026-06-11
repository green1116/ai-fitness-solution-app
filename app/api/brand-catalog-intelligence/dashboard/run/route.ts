import { NextResponse } from "next/server";
import { runBrandCatalogDashboardRuntime } from "@/lib/brand-catalog-intelligence/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBrandCatalogDashboardRuntime({ deploymentId: "brand-catalog-dashboard-api" }));
}
