import { NextRequest, NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { getProjectDocuments } from "@/lib/portal/v58/documents/documents.aggregator";
import { recordDeliveryAnalytics } from "@/lib/portal/v58/analytics/delivery-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ projectId: string }> },
) {
  const auth = await getPortalUserContext();
  if (!auth?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const data = await getProjectDocuments(auth.organizationId, projectId);
  if (!data) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  recordDeliveryAnalytics({
    event: "tender_pack_generated",
    userId: auth.id,
    organizationId: auth.organizationId,
    projectId,
    meta: { view: "project_documents" },
  });

  return NextResponse.json({ ok: true, ...data });
}
