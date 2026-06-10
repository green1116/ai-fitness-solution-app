import { NextResponse } from "next/server";
import { runSuccessPlaybookRuntime } from "@/lib/customer-success/playbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runSuccessPlaybookRuntime({ deploymentId: "playbook-api" }));
}
