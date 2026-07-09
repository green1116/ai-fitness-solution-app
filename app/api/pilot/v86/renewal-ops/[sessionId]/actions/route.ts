import { NextResponse } from "next/server";

import {
  assignRenewalOwner,
  markRenewalChurned,
  markRenewalRenewed,
  markRenewalSaved,
  recordRenewalAttempt,
  scheduleRenewalOutreach,
} from "@/lib/pilot/v86";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ACTIONS = [
  "assign_owner",
  "schedule_outreach",
  "renewal_attempt",
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
      let renewalOps;
      switch (action) {
        case "assign_owner":
          renewalOps = assignRenewalOwner({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            ownerId: body.ownerId ?? ctx.id,
            ownerName: body.ownerName,
          });
          break;
        case "schedule_outreach":
          renewalOps = scheduleRenewalOutreach({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            scheduledAt: body.scheduledAt ?? new Date(Date.now() + 86400000).toISOString(),
            note: body.note,
          });
          break;
        case "renewal_attempt":
          renewalOps = recordRenewalAttempt({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            response: body.response,
          });
          break;
        case "mark_saved":
          renewalOps = markRenewalSaved({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_renewed":
          renewalOps = markRenewalRenewed({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
          });
          break;
        case "mark_churned":
          renewalOps = markRenewalChurned({
            sessionId,
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            note: body.note,
            reason: body.reason,
          });
          break;
      }

      return NextResponse.json({ ok: true, renewalOps, action });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      const status =
        message === "NOT_RELEASED" || message === "SESSION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
