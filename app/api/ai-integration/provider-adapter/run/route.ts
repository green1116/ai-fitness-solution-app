import { NextResponse } from "next/server";
import { runAiProviderAdapterRuntime } from "@/lib/ai-integration/provider-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    runAiProviderAdapterRuntime({ deploymentId: "provider-adapter-api", forceMode: "stub" }),
  );
}
