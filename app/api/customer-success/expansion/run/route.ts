import { NextResponse } from "next/server";
import { runExpansionRuntime } from "@/lib/customer-success/expansion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runExpansionRuntime({ deploymentId: "expansion-api" }));
}
