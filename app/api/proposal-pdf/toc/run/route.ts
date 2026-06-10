import { NextResponse } from "next/server";
import { runProposalTocRuntime } from "@/lib/proposal-pdf/toc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runProposalTocRuntime({ deploymentId: "toc-api" }));
}
