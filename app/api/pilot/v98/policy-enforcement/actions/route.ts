import { NextResponse } from "next/server";

import {
  autoAssignReviewer,
  autoEnforcementHold,
  autoEnforcementPurge,
  autoMarkDue,
  autoRequestExport,
} from "@/lib/pilot/v98";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "auto_assign_reviewer",
  "auto_mark_due",
  "auto_hold",
  "auto_purge",
  "auto_request_export",
] as const;

type ActionType = (typeof ACTIONS)[number];

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as ActionType | undefined;
    const archiveRecordId = body.archiveRecordId as string | undefined;

    if (!action || !ACTIONS.includes(action)) {
      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    }
    if (!archiveRecordId) {
      return NextResponse.json({ ok: false, code: "ARCHIVE_RECORD_ID_REQUIRED" }, { status: 400 });
    }

    const base = {
      organizationId: ctx.organizationId,
      actorId: ctx.id,
      archiveRecordId,
      note: body.note,
    };

    try {
      switch (action) {
        case "auto_assign_reviewer": {
          const record = autoAssignReviewer({
            ...base,
            reviewerId: body.reviewerId,
            reviewerName: body.reviewerName,
          });
          return NextResponse.json({ ok: true, record, action });
        }
        case "auto_mark_due": {
          const record = autoMarkDue(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "auto_hold": {
          const record = autoEnforcementHold(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "auto_purge": {
          const record = autoEnforcementPurge(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "auto_request_export": {
          const result = autoRequestExport(base);
          return NextResponse.json({
            ok: true,
            record: result.record,
            auditSnapshot: result.auditSnapshot,
            action,
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 409 });
    }
  });
}
