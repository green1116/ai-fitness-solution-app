import { NextResponse } from "next/server";
import { runROINarrativeRuntime } from "@/lib/proposal-delivery-packaging/roi-narrative";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runROINarrativeRuntime({ deploymentId: "roi-narrative-api" }));
}
