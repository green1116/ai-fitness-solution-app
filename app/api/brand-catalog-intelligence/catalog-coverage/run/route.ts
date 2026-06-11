import { NextResponse } from "next/server";
import { runCatalogCoverageRuntime } from "@/lib/brand-catalog-intelligence/catalog-coverage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCatalogCoverageRuntime({ deploymentId: "catalog-coverage-api" }));
}
