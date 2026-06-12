import { NextResponse } from "next/server";
import { buildTenderResponsePackReport } from "@/lib/tender-response-pack/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildTenderResponsePackReport({ deploymentId: "tender-response-pack-report-api" }));
}
