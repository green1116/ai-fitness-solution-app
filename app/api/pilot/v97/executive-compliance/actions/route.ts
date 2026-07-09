import { NextResponse } from "next/server";

import {
  assignComplianceReviewer,
  markComplianceHold,
  markCompliancePurge,
  markComplianceReviewed,
  requestComplianceExport,
} from "@/lib/pilot/v97";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "assign_reviewer",
  "mark_reviewed",
  "mark_hold",
  "mark_purge",
  "request_export",
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
        case "assign_reviewer": {
          if (!body.reviewerId) {
            return NextResponse.json({ ok: false, code: "REVIEWER_ID_REQUIRED" }, { status: 400 });
          }
          const record = assignComplianceReviewer({
            ...base,
            reviewerId: body.reviewerId,
            reviewerName: body.reviewerName,
          });
          return NextResponse.json({ ok: true, record, action });
        }
        case "mark_reviewed": {
          const record = markComplianceReviewed(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "mark_hold": {
          const record = markComplianceHold(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "mark_purge": {
          const record = markCompliancePurge(base);
          return NextResponse.json({ ok: true, record, action });
        }
        case "request_export": {
          const exportResult = requestComplianceExport(base);
          return NextResponse.json({ ok: true, export: exportResult, action });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "ACTION_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 409 });
    }
  });
}
