import { NextResponse } from "next/server";
import { buildOperationalGovernanceRuntime } from "@/lib/operations/governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const governance = buildOperationalGovernanceRuntime({
    deploymentId: "operational-governance-api",
  });
  return NextResponse.json(governance);
}
