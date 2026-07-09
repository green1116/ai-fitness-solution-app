import { NextResponse } from "next/server";

import {
  certifyProductionReady,
  generateCertificationPackage,
  recordGateReview,
  waiveGate,
} from "@/lib/pilot/v99";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "generate_certification_package",
  "record_gate_review",
  "waive_gate",
  "certify_ready",
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
        case "generate_certification_package": {
          const pack = generateCertificationPackage({
            ...base,
            title: body.title,
          });
          return NextResponse.json({ ok: true, pack, action });
        }
        case "record_gate_review": {
          if (!body.gateId || !body.status) {
            return NextResponse.json(
              { ok: false, code: "GATE_ID_AND_STATUS_REQUIRED" },
              { status: 400 },
            );
          }
          const pack = recordGateReview({
            ...base,
            gateId: body.gateId,
            status: body.status,
          });
          return NextResponse.json({ ok: true, pack, action });
        }
        case "waive_gate": {
          if (!body.gateId) {
            return NextResponse.json({ ok: false, code: "GATE_ID_REQUIRED" }, { status: 400 });
          }
          const pack = waiveGate({ ...base, gateId: body.gateId });
          return NextResponse.json({ ok: true, pack, action });
        }
        case "certify_ready": {
          const pack = certifyProductionReady(base);
          return NextResponse.json({ ok: true, pack, action });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 409 });
    }
  });
}
