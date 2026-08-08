import { NextResponse } from "next/server";

import {
  buildIntakeOpsSnapshot,
  getIntakeSession,
  listIntakeOpsBoard,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — org intake ops board / exceptions */
export async function GET(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId")?.trim();
    if (sessionId) {
      const session = getIntakeSession(sessionId);
      if (!session || session.organizationId !== ctx.organizationId) {
        return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
      }
      return NextResponse.json({
        ok: true,
        snapshot: buildIntakeOpsSnapshot(session),
      });
    }

    const board = listIntakeOpsBoard(ctx.organizationId);
    return NextResponse.json({
      ok: true,
      counts: board.counts,
      exceptions: board.exceptions,
      sessions: board.all,
    });
  });
}
