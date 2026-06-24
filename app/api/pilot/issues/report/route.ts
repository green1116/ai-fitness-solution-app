import { NextResponse } from "next/server";
import {
  ISSUE_SEVERITIES,
  type IssueSeverity,
  reportPilotIssue,
} from "@/lib/portal/v62/store/pilot-issues.store";
import { recordPilotTelemetry } from "@/lib/portal/v62/store/pilot-telemetry.store";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPortalRoute("authenticated", async (ctx) => {
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const severity = String(body?.severity ?? "medium").toLowerCase() as IssueSeverity;

    if (!title || !description) {
      return NextResponse.json({ ok: false, code: "FIELDS_REQUIRED" }, { status: 400 });
    }
    if (!ISSUE_SEVERITIES.includes(severity)) {
      return NextResponse.json({ ok: false, code: "INVALID_SEVERITY" }, { status: 400 });
    }

    const issue = reportPilotIssue({
      organizationId: ctx.organizationId ?? "unknown",
      userId: ctx.id,
      title,
      description,
      severity,
      category: body?.category ? String(body.category) : undefined,
    });
    recordPilotTelemetry({
      name: "issue_reported",
      organizationId: ctx.organizationId ?? undefined,
      userId: ctx.id,
      success: true,
      meta: { issueId: issue.id, severity },
    });

    return NextResponse.json({ ok: true, issue });
  });
}
