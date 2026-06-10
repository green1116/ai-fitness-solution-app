import { NextResponse } from "next/server";
import { generateWithGateway } from "@/lib/ai-integration/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = generateWithGateway({
    deploymentId: "gateway-api",
    prompt: "政府健身中心采购项目技术方案",
    capability: "high-quality-proposal",
    method: "proposal",
    forceMode: "stub",
  });
  return NextResponse.json(result);
}
