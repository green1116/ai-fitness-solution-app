import { NextResponse } from "next/server";
import { runOrderRuntime } from "@/lib/revenue-foundation/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V10 Order Runtime API — readonly GET surface.
 */
export async function GET() {
  const result = runOrderRuntime({ deploymentId: "order-api" });
  return NextResponse.json(result);
}
