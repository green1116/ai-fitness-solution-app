import { NextResponse } from "next/server";
import { runVariantPackRuntime } from "@/lib/tender-response-pack/variant-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runVariantPackRuntime({ deploymentId: "variant-pack-api" }));
}
