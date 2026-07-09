import { NextResponse } from "next/server";

import {
  generateBriefingPack,
  markDecisionActed,
  recordBriefingAction,
} from "@/lib/pilot/v94";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "generate_briefing_pack",
  "record_briefing_action",
  "mark_decision_acted",
] as const;

type ActionType = (typeof ACTIONS)[number];

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as ActionType | undefined;

    if (!action || !ACTIONS.includes(action)) {
      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    }

    try {
      switch (action) {
        case "generate_briefing_pack": {
          const pack = generateBriefingPack({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            title: body.title,
          });
          return NextResponse.json({ ok: true, pack, action });
        }
        case "record_briefing_action": {
          if (!body.briefingId || !body.sessionId) {
            return NextResponse.json(
              { ok: false, code: "BRIEFING_ID_AND_SESSION_REQUIRED" },
              { status: 400 },
            );
          }
          const pack = recordBriefingAction({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            briefingId: body.briefingId,
            sessionId: body.sessionId,
            note: body.note,
          });
          return NextResponse.json({ ok: true, pack, action });
        }
        case "mark_decision_acted": {
          if (!body.briefingId || !body.sessionId) {
            return NextResponse.json(
              { ok: false, code: "BRIEFING_ID_AND_SESSION_REQUIRED" },
              { status: 400 },
            );
          }
          const pack = markDecisionActed({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            briefingId: body.briefingId,
            sessionId: body.sessionId,
            note: body.note,
          });
          return NextResponse.json({ ok: true, pack, action });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 409 });
    }
  });
}
