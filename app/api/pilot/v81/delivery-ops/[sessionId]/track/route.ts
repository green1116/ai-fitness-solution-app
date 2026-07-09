import { NextResponse } from "next/server";

import { getDeliveryTrackingSummary, recordDeliveryTrackingEvent } from "@/lib/pilot/v81";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ALLOWED_TYPES = [
  "delivery_opened",
  "artifact_downloaded",
  "artifact_viewed",
  "pending_action",
  "delivery_failed",
] as const;

export async function GET(_req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    try {
      const tracking = getDeliveryTrackingSummary(sessionId);
      return NextResponse.json({ ok: true, ...tracking, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "TRACKING_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 500 });
    }
  });
}

export async function POST(req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const type = body.type as (typeof ALLOWED_TYPES)[number] | undefined;

    if (!type || !ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ ok: false, code: "INVALID_EVENT_TYPE" }, { status: 400 });
    }

    try {
      const event = recordDeliveryTrackingEvent({
        sessionId,
        organizationId: ctx.organizationId,
        actorId: ctx.id,
        type,
        artifactKind: body.artifactKind,
        meta: body.meta,
      });
      const tracking = getDeliveryTrackingSummary(sessionId);
      return NextResponse.json({ ok: true, event, ...tracking, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "TRACK_FAILED";
      const status =
        message === "NOT_RELEASED" || message === "SESSION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
