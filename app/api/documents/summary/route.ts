import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { getDocumentsSummary } from "@/lib/portal/v58/documents/documents.aggregator";
import { recordDeliveryAnalytics } from "@/lib/portal/v58/analytics/delivery-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const summary = await getDocumentsSummary(ctx.organizationId);

  recordDeliveryAnalytics({
    event: "document_viewed",
    userId: ctx.id,
    organizationId: ctx.organizationId,
    meta: { section: "summary" },
  });

  return NextResponse.json({ ok: true, summary, organizationId: ctx.organizationId });
}
