import { postCommandAdmission } from "@/lib/operations/command/api/handlers";
import {
  commandApiError,
  commandApiResponse,
  deploymentIdFromRequest,
  parseCommandApiBody,
} from "@/lib/operations/command/api/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await parseCommandApiBody<{ deploymentId?: string; intentId?: string }>(request);
  if (!body) return commandApiError("invalid-json-body");
  return commandApiResponse(
    postCommandAdmission({
      deploymentId: deploymentIdFromRequest(request, body),
      intentId: body.intentId,
    }),
  );
}
