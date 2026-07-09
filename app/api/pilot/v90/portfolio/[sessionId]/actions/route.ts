import { NextResponse } from "next/server";

import { recordPortfolioPriorityAction } from "@/lib/pilot/v90";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function POST(req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action as string | undefined;

    if (action !== "record_priority") {
      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    }

    try {
      const priorityAction = recordPortfolioPriorityAction({
        sessionId,
        organizationId: ctx.organizationId,
        actorId: ctx.id,
        note: body.note ?? "优先级已确认",
      });

      return NextResponse.json({ ok: true, priorityAction, action });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 409 });
    }
  });
}
