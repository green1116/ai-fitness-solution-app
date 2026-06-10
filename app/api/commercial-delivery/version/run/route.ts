import { NextResponse } from "next/server";
import { runVersionRuntime } from "@/lib/commercial-delivery/version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runVersionRuntime({ deploymentId: "version-api" }));
}
