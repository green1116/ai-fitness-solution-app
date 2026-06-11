import { NextResponse } from "next/server";
import { runProductLaunchRuntime } from "@/lib/go-to-market/product-launch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProductLaunchRuntime({ deploymentId: "launch-api" }));
}
