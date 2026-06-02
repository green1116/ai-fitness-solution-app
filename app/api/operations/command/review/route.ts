import { postCommandReview } from "@/lib/operations/command/api/handlers";
import type { CommandReviewAction } from "@/lib/operations/command/api/types";
import {
  commandApiError,
  commandApiResponse,
  deploymentIdFromRequest,
  parseCommandApiBody,
} from "@/lib/operations/command/api/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_ACTIONS: CommandReviewAction[] = [
  "approve",
  "reject",
  "override",
  "suspend",
  "cancel",
  "escalate",
  "rollback-request",
  "confirm",
];

export async function POST(request: Request) {
  const body = await parseCommandApiBody<{
    deploymentId?: string;
    intentId?: string;
    action?: CommandReviewAction;
    operator?: string;
    reason?: string;
  }>(request);
  if (!body?.intentId || !body.action) return commandApiError("intentId and action required");
  if (!REVIEW_ACTIONS.includes(body.action)) return commandApiError("invalid-action");

  return commandApiResponse(
    postCommandReview({
      deploymentId: deploymentIdFromRequest(request, body),
      intentId: body.intentId,
      action: body.action,
      operator: body.operator,
      reason: body.reason,
    }),
  );
}
