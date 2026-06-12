import { NextResponse } from "next/server";
import { runResponsePackContextRuntime } from "@/lib/tender-response-pack/response-pack-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runResponsePackContextRuntime({ deploymentId: "response-pack-context-api" }));
}
