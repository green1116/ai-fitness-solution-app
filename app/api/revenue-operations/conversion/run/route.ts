import { NextResponse } from "next/server";
import { runConversionRuntime } from "@/lib/revenue-operations/conversion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runConversionRuntime({ deploymentId: "conversion-api" }));
}
