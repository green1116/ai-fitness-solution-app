import { NextResponse } from "next/server";
import { runOutreachRuntime } from "@/lib/go-to-market/outreach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runOutreachRuntime({ deploymentId: "outreach-api" }));
}
