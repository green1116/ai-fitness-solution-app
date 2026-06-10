import { NextResponse } from "next/server";
import { runProjectClassificationRuntime } from "@/lib/tender-intelligence/classification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProjectClassificationRuntime({ deploymentId: "classification-api" }));
}
