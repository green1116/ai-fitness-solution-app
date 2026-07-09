import { NextResponse } from "next/server";

import {
  assignPortfolioOwner,
  markPortfolioCompleted,
  markPortfolioDeferred,
  markPortfolioLost,
  recordStrategicAction,
  scheduleStrategicReview,
} from "@/lib/pilot/v91";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ACTIONS = [
  "assign_portfolio_owner",
  "schedule_strategic_review",
  "record_action",
  "mark_completed",
  "mark_deferred",
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
      let portfolioOps;
      switch (action) {
        case "assign_portfolio_owner":
          portfolioOps = assignPortfolioOwner({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            ownerId: body.ownerId ?? ctx.id,
            ownerName: body.ownerName,
          });
          break;
        case "schedule_strategic_review":
          portfolioOps = scheduleStrategicReview({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            scheduledAt: body.scheduledAt ?? new Date(Date.now() + 86400000 * 7).toISOString(),
            note: body.note,
          });
          break;
        case "record_action":
          portfolioOps = recordStrategicAction({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_completed":
          portfolioOps = markPortfolioCompleted({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_deferred":
          portfolioOps = markPortfolioDeferred({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_lost":
          portfolioOps = markPortfolioLost({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            reason: body.reason,
          });
          break;
      }

      return NextResponse.json({ ok: true, portfolioOps, action });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      const status =
        message === "NOT_RELEASED" || message === "SESSION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
