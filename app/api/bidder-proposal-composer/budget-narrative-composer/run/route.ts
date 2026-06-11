import { NextResponse } from "next/server";
import { runBudgetNarrativeComposerRuntime } from "@/lib/bidder-proposal-composer/budget-narrative";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBudgetNarrativeComposerRuntime({ deploymentId: "budget-narrative-composer-api" }));
}
