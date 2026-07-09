import { NextResponse } from "next/server";

import {
  getIntakeDeliverySnapshot,
  getIntakeFreezeSnapshot,
  getIntakeSession,
  syncSessionWorkflowStatus,
} from "@/lib/pilot/v80";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(_req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    let session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    session = await syncSessionWorkflowStatus(sessionId, session);
    const delivery = await getIntakeDeliverySnapshot(session, ctx.organizationId);

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      ...delivery,
      deliveryLock: getIntakeFreezeSnapshot(session),
      readOnly: session.frozen === true,
    });
  });
}
