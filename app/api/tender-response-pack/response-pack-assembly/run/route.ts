import { NextResponse } from "next/server";
import { runResponsePackAssemblyRuntime } from "@/lib/tender-response-pack/response-pack-assembly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runResponsePackAssemblyRuntime({ deploymentId: "response-pack-assembly-api" }));
}
