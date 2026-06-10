import { NextResponse } from "next/server";
import { runRenewalRuntime } from "@/lib/revenue-operations/renewal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runRenewalRuntime({ deploymentId: "renewal-api" }));
}
