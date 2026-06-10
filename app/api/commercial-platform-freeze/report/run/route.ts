import { NextResponse } from "next/server";
import { buildCommercialPlatformReport } from "@/lib/commercial-platform-freeze/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildCommercialPlatformReport({ deploymentId: "report-api" }));
}
