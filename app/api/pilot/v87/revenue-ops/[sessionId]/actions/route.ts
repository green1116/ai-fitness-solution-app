import { NextResponse } from "next/server";

import {
  assignRevenueOwner,
  escalateRevenueCase,
  markRevenueChurned,
  markRevenueRenewed,
  markRevenueSaved,
  scheduleRevenueFollowUp,
} from "@/lib/pilot/v87";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ACTIONS = [
  "assign_owner",
  "escalate",
  "schedule_follow_up",
  "mark_saved",
  "mark_renewed",
  "mark_churned",
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
      let revenueOps;
      switch (action) {
        case "assign_owner":
          revenueOps = assignRevenueOwner({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            ownerId: body.ownerId ?? ctx.id,
            ownerName: body.ownerName,
          });
          break;
        case "escalate":
          revenueOps = escalateRevenueCase({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            escalateTo: body.escalateTo,
          });
          break;
        case "schedule_follow_up":
          revenueOps = scheduleRevenueFollowUp({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            scheduledAt: body.scheduledAt ?? new Date(Date.now() + 86400000).toISOString(),
            note: body.note,
          });
          break;
        case "mark_saved":
          revenueOps = markRevenueSaved({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_renewed":
          revenueOps = markRevenueRenewed({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_churned":
          revenueOps = markRevenueChurned({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            reason: body.reason,
          });
          break;
      }

      return NextResponse.json({ ok: true, revenueOps, action });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      const status =
        message === "NOT_RELEASED" || message === "SESSION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
