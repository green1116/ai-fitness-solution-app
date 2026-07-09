import { NextResponse } from "next/server";

import {
  getIntakeSession,
  recoverIntakeSession,
  type RecoverIntakeAction,
} from "@/lib/pilot/v80";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const ACTIONS = new Set<RecoverIntakeAction>([
  "restore_snapshot",
  "rollback_valid",
  "retry_generation",
]);

export async function POST(req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "").trim() as RecoverIntakeAction;
    if (!ACTIONS.has(action)) {
      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    }

    try {
      const result = await recoverIntakeSession({
        sessionId,
        organizationId: ctx.organizationId,
        actorId: ctx.id,
        action,
        auditEntryId: body?.auditEntryId ? String(body.auditEntryId) : undefined,
        explicitRecovery: body?.explicitRecovery === true,
      });
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "RECOVER_FAILED";
      const status =
        message === "SESSION_NOT_FOUND" || message === "ORG_MISMATCH"
          ? 404
          : message === "AUDIT_ENTRY_REQUIRED" ||
              message === "SNAPSHOT_NOT_FOUND" ||
              message === "NO_VALID_REVIEW_SNAPSHOT" ||
              message === "ENTITIES_NOT_CREATED"
            ? 400
            : message === "APPROVE_IN_PROGRESS"
              ? 409
              : message === "SESSION_ALREADY_READY"
                ? 409
                : message === "SESSION_FROZEN"
                  ? 409
                  : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
