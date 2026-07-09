import { NextResponse } from "next/server";

import {
  assignFollowUpOwner,
  escalateHotAccount,
  markFollowUpResolved,
  recordContactAttempt,
  scheduleCallback,
  sendReminder,
  updateFollowUpResponseStatus,
} from "@/lib/pilot/v84";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ACTIONS = [
  "assign_owner",
  "contact_attempt",
  "update_response",
  "escalate_hot",
  "schedule_callback",
  "send_reminder",
  "mark_resolved",
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
      let followUp;
      switch (action) {
        case "assign_owner":
          followUp = assignFollowUpOwner({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            ownerId: body.ownerId ?? ctx.id,
            ownerName: body.ownerName,
          });
          break;
        case "contact_attempt":
          followUp = recordContactAttempt({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            responseStatus: body.responseStatus,
          });
          break;
        case "update_response":
          followUp = updateFollowUpResponseStatus({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            responseStatus: body.responseStatus ?? "unknown",
            note: body.note,
          });
          break;
        case "escalate_hot":
          followUp = escalateHotAccount({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            reason: body.reason,
          });
          break;
        case "schedule_callback":
          followUp = scheduleCallback({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            scheduledAt: body.scheduledAt ?? new Date(Date.now() + 86400000).toISOString(),
            note: body.note,
          });
          break;
        case "send_reminder":
          followUp = sendReminder({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            channel: body.channel,
            note: body.note,
          });
          break;
        case "mark_resolved":
          followUp = markFollowUpResolved({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
      }

      return NextResponse.json({ ok: true, followUp, action });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      const status =
        message === "NOT_RELEASED" || message === "SESSION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
