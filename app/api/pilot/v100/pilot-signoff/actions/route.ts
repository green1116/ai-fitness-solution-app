import { NextResponse } from "next/server";

import {
  collectReadiness,
  finalSignoff,
  freezeBaseline,
  releaseBaseline,
} from "@/lib/pilot/v100";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "collect_readiness",
  "final_signoff",
  "freeze_baseline",
  "release_baseline",
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

    const base = {
      organizationId: ctx.organizationId,
      actorId: ctx.id,
      note: body.note,
    };

    try {
      switch (action) {
        case "collect_readiness": {
          const report = collectReadiness(base);
          return NextResponse.json({ ok: true, report, action });
        }
        case "final_signoff": {
          const state = finalSignoff(base);
          return NextResponse.json({ ok: true, state, action });
        }
        case "freeze_baseline": {
          const state = freezeBaseline(base);
          return NextResponse.json({ ok: true, state, action });
        }
        case "release_baseline": {
          const state = releaseBaseline(base);
          return NextResponse.json({ ok: true, state, action });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 409 });
    }
  });
}
