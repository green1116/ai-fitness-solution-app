import { NextResponse } from "next/server";
import { runDeliveryLedgerRuntime } from "@/lib/commercial-delivery/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runDeliveryLedgerRuntime({ deploymentId: "ledger-api" }));
}
