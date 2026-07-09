import { NextResponse } from "next/server";

import {
  exportExecutiveSummary,
  generateBoardPacket,
  markPacketReviewed,
  schedulePacketReview,
} from "@/lib/pilot/v93";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "generate_packet",
  "schedule_review",
  "mark_reviewed",
  "export_summary",
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
        case "generate_packet": {
          const packet = generateBoardPacket({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            title: body.title,
          });
          return NextResponse.json({ ok: true, packet, action });
        }
        case "schedule_review": {
          if (!body.packetId) {
            return NextResponse.json({ ok: false, code: "PACKET_ID_REQUIRED" }, { status: 400 });
          }
          const packet = schedulePacketReview({
            organizationId: ctx.organizationId,
            packetId: body.packetId,
            actorId: ctx.id,
            scheduledAt:
              body.scheduledAt ?? new Date(Date.now() + 86400000 * 7).toISOString(),
            note: body.note,
          });
          return NextResponse.json({ ok: true, packet, action });
        }
        case "mark_reviewed": {
          if (!body.packetId) {
            return NextResponse.json({ ok: false, code: "PACKET_ID_REQUIRED" }, { status: 400 });
          }
          const packet = markPacketReviewed({
            organizationId: ctx.organizationId,
            packetId: body.packetId,
            actorId: ctx.id,
            note: body.note,
          });
          return NextResponse.json({ ok: true, packet, action });
        }
        case "export_summary": {
          const exportResult = exportExecutiveSummary({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            packetId: body.packetId,
          });
          return NextResponse.json({ ok: true, export: exportResult, action });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 409 });
    }
  });
}
