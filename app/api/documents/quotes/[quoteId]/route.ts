import { NextRequest, NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { getQuoteDocuments } from "@/lib/portal/v58/documents/documents.aggregator";
import { recordDeliveryAnalytics } from "@/lib/portal/v58/analytics/delivery-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ quoteId: string }> },
) {
  const auth = await getPortalUserContext();
  if (!auth?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { quoteId } = await ctx.params;
  const data = await getQuoteDocuments(auth.organizationId, quoteId);
  if (!data) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  recordDeliveryAnalytics({
    event: "document_viewed",
    userId: auth.id,
    organizationId: auth.organizationId,
    quoteId,
    projectId: data.quote.projectId,
  });

  return NextResponse.json({ ok: true, ...data });
}
