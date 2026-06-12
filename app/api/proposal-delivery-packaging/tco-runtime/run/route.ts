import { NextResponse } from "next/server";
import { runTCORuntime } from "@/lib/proposal-delivery-packaging/tco-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runTCORuntime({ deploymentId: "tco-runtime-api" }));
}
