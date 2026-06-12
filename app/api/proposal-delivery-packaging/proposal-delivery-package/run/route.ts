import { NextResponse } from "next/server";
import { runProposalDeliveryPackageRuntime } from "@/lib/proposal-delivery-packaging/proposal-delivery-package";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalDeliveryPackageRuntime({ deploymentId: "proposal-delivery-package-api" }));
}
