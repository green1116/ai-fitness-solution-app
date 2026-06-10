import { NextResponse } from "next/server";
import { runAdoptionRuntime } from "@/lib/customer-success/adoption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runAdoptionRuntime({ deploymentId: "adoption-api" }));
}
