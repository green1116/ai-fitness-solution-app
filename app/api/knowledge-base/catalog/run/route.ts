import { NextResponse } from "next/server";
import { runKnowledgeCatalogRuntime } from "@/lib/knowledge-base/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runKnowledgeCatalogRuntime({ deploymentId: "catalog-api" }));
}
