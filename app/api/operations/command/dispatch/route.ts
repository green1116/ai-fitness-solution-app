import { postCommandDispatch } from "@/lib/operations/command/api/handlers";
import {
  commandApiError,
  commandApiResponse,
  deploymentIdFromRequest,
  parseCommandApiBody,
} from "@/lib/operations/command/api/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await parseCommandApiBody<{ deploymentId?: string; dryRun?: boolean }>(request);
  if (!body) return commandApiError("invalid-json-body");
  return commandApiResponse(
    postCommandDispatch({
      deploymentId: deploymentIdFromRequest(request, body),
      dryRun: body.dryRun ?? true,
    }),
  );
}
