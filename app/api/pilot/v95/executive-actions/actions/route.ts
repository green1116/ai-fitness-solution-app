import { NextResponse } from "next/server";

import {
  assignExecutiveActionOwner,
  confirmExecutiveDecision,
  markExecutiveActionActed,
  markExecutiveActionClosed,
  markExecutiveActionDeferred,
  recordExecutiveOutcome,
} from "@/lib/pilot/v95";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "assign_executive_owner",
  "confirm_decision",
  "mark_acted",
  "mark_deferred",
  "mark_closed",
  "record_outcome",
] as const;

type ActionType = (typeof ACTIONS)[number];

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as ActionType | undefined;
    const sessionId = body.sessionId as string | undefined;

    if (!action || !ACTIONS.includes(action)) {
      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ ok: false, code: "SESSION_ID_REQUIRED" }, { status: 400 });
    }

    const base = {
      sessionId,
      organizationId: ctx.organizationId,
      actorId: ctx.id,
      note: body.note,
    };

    try {
      switch (action) {
        case "assign_executive_owner": {
          if (!body.ownerId) {
            return NextResponse.json({ ok: false, code: "OWNER_ID_REQUIRED" }, { status: 400 });
          }
          const record = assignExecutiveActionOwner({
            ...base,
            ownerId: body.ownerId,
            ownerName: body.ownerName,
          });
          return NextResponse.json({ ok: true, record, action });
        }
        case "confirm_decision": {
          const record = confirmExecutiveDecision(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "mark_acted": {
          const record = markExecutiveActionActed(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "mark_deferred": {
          const record = markExecutiveActionDeferred(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "mark_closed": {
          const record = markExecutiveActionClosed(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "record_outcome": {
          if (!body.outcomeNote) {
            return NextResponse.json({ ok: false, code: "OUTCOME_NOTE_REQUIRED" }, { status: 400 });
          }
          const record = recordExecutiveOutcome({
            ...base,
            outcomeNote: body.outcomeNote,
          });
          return NextResponse.json({ ok: true, record, action });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 409 });
    }
  });
}
