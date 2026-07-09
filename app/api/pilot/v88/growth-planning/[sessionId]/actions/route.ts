import { NextResponse } from "next/server";

import {
  assignGrowthOwner,
  logGrowthOutcome,
  markGrowthExpanded,
  markGrowthLost,
  markGrowthRetained,
  scheduleExpansionFollowUp,
} from "@/lib/pilot/v88";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ACTIONS = [
  "assign_growth_owner",
  "schedule_expansion_follow_up",
  "mark_retained",
  "mark_expanded",
  "mark_lost",
  "log_outcome",
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
      let growthOps;
      switch (action) {
        case "assign_growth_owner":
          growthOps = assignGrowthOwner({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            ownerId: body.ownerId ?? ctx.id,
            ownerName: body.ownerName,
          });
          break;
        case "schedule_expansion_follow_up":
          growthOps = scheduleExpansionFollowUp({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            scheduledAt: body.scheduledAt ?? new Date(Date.now() + 86400000).toISOString(),
            note: body.note,
          });
          break;
        case "mark_retained":
          growthOps = markGrowthRetained({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_expanded":
          growthOps = markGrowthExpanded({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_lost":
          growthOps = markGrowthLost({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            reason: body.reason,
          });
          break;
        case "log_outcome":
          growthOps = logGrowthOutcome({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note ?? "记录增长结果",
            meta: body.meta,
          });
          break;
      }

      return NextResponse.json({ ok: true, growthOps, action });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      const status =
        message === "NOT_RELEASED" || message === "SESSION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
