import { NextResponse } from "next/server";
import { runCompatibilityRuntime } from "@/lib/equipment-selection/compatibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runCompatibilityRuntime({ deploymentId: "compatibility-api" }));
}
