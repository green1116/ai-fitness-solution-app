import { NextResponse } from "next/server";

import {
  assignExpansionOwner,
  markExpansionExpanded,
  markExpansionLost,
  markExpansionRetained,
  recordExpansionProposal,
  scheduleExpansionFollowUp,
} from "@/lib/pilot/v89";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ACTIONS = [
  "assign_owner",
  "schedule_expansion_follow_up",
  "record_proposal",
  "mark_expanded",
  "mark_retained",
  "mark_lost",
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
      let expansionOps;
      switch (action) {
        case "assign_owner":
          expansionOps = assignExpansionOwner({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            ownerId: body.ownerId ?? ctx.id,
            ownerName: body.ownerName,
          });
          break;
        case "schedule_expansion_follow_up":
          expansionOps = scheduleExpansionFollowUp({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            scheduledAt: body.scheduledAt ?? new Date(Date.now() + 86400000).toISOString(),
            note: body.note,
          });
          break;
        case "record_proposal":
          expansionOps = recordExpansionProposal({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            proposalValue: body.proposalValue,
          });
          break;
        case "mark_expanded":
          expansionOps = markExpansionExpanded({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_retained":
          expansionOps = markExpansionRetained({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_lost":
          expansionOps = markExpansionLost({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            reason: body.reason,
          });
          break;
      }

      return NextResponse.json({ ok: true, expansionOps, action });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      const status =
        message === "NOT_RELEASED" || message === "SESSION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
