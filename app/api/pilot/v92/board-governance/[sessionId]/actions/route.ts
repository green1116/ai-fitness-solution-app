import { NextResponse } from "next/server";

import {
  assignExecutiveOwner,
  markGovernanceApproved,
  markGovernanceBlocked,
  markGovernanceDeferred,
  recordGovernanceDecision,
  scheduleBoardReview,
} from "@/lib/pilot/v92";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ACTIONS = [
  "assign_executive_owner",
  "schedule_board_review",
  "record_decision",
  "mark_approved",
  "mark_deferred",
  "mark_blocked",
] as const;

type ActionType = (typeof ACTIONS)[number];

export async function POST(req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action as ActionType | undefined;

    if (!action || !ACTIONS.includes(action)) {
      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    }

    try {
      let governance;
      switch (action) {
        case "assign_executive_owner":
          governance = assignExecutiveOwner({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            ownerId: body.ownerId ?? ctx.id,
            ownerName: body.ownerName,
          });
          break;
        case "schedule_board_review":
          governance = scheduleBoardReview({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            scheduledAt:
              body.scheduledAt ?? new Date(Date.now() + 86400000 * 14).toISOString(),
            note: body.note,
          });
          break;
        case "record_decision":
          governance = recordGovernanceDecision({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            decision: body.decision,
          });
          break;
        case "mark_approved":
          governance = markGovernanceApproved({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_deferred":
          governance = markGovernanceDeferred({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_blocked":
          governance = markGovernanceBlocked({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            reason: body.reason,
          });
          break;
      }

      return NextResponse.json({ ok: true, governance, action });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      const status =
        message === "NOT_RELEASED" || message === "SESSION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
