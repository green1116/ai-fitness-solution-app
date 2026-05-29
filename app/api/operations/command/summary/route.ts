import { getCommandSummary } from "@/lib/operations/command/api/handlers";
import { commandApiResponse, deploymentIdFromRequest } from "@/lib/operations/command/api/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const deploymentId = deploymentIdFromRequest(request);
  return commandApiResponse(getCommandSummary(deploymentId));
}
