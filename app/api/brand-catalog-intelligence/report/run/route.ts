import { NextResponse } from "next/server";
import { buildBrandCatalogIntelligenceReport } from "@/lib/brand-catalog-intelligence/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildBrandCatalogIntelligenceReport({ deploymentId: "report-api" }));
}
