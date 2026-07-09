import { NextResponse } from "next/server";

import {
  archiveRecord,
  exportAuditBundle,
  markArchiveReviewed,
  restoreArchiveView,
  retrieveAuditTrail,
} from "@/lib/pilot/v96";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "archive_record",
  "restore_view",
  "export_audit_bundle",
  "mark_reviewed",
] as const;

type ActionType = (typeof ACTIONS)[number];

export async function GET(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ ok: false, code: "SESSION_ID_REQUIRED" }, { status: 400 });
    }

    try {
      const trail = retrieveAuditTrail(ctx.organizationId, sessionId);
      return NextResponse.json({ ok: true, trail, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "RETRIEVAL_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 500 });
    }
  });
}

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
        case "archive_record": {
          if (!body.sessionId) {
            return NextResponse.json({ ok: false, code: "SESSION_ID_REQUIRED" }, { status: 400 });
          }
          const record = archiveRecord({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            sessionId: body.sessionId,
            projectName: body.projectName,
            note: body.note,
          });
          return NextResponse.json({ ok: true, record, action });
        }
        case "restore_view": {
          if (!body.archiveRecordId) {
            return NextResponse.json(
              { ok: false, code: "ARCHIVE_RECORD_ID_REQUIRED" },
              { status: 400 },
            );
          }
          const record = restoreArchiveView({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            archiveRecordId: body.archiveRecordId,
            note: body.note,
          });
          return NextResponse.json({ ok: true, record, action });
        }
        case "mark_reviewed": {
          if (!body.archiveRecordId) {
            return NextResponse.json(
              { ok: false, code: "ARCHIVE_RECORD_ID_REQUIRED" },
              { status: 400 },
            );
          }
          const record = markArchiveReviewed({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            archiveRecordId: body.archiveRecordId,
            note: body.note,
          });
          return NextResponse.json({ ok: true, record, action });
        }
        case "export_audit_bundle": {
          const exportResult = exportAuditBundle({
            organizationId: ctx.organizationId,
            actorId: ctx.id,
            sessionId: body.sessionId,
            archiveRecordId: body.archiveRecordId,
            query: body.query,
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
