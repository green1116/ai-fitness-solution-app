import { NextRequest, NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { getWorkspaceSummary } from "@/lib/portal/v57/experience/workspace-summary.service";
import { recordProductAnalytics } from "@/lib/portal/v57/experience/product-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V57 P3 — Workspace health / summary (read-only aggregation)
 */
export async function GET(req: NextRequest) {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json(
      { ok: false, code: "AUTH_REQUIRED", message: "请先登录并加入组织" },
      { status: 401 },
    );
  }

  const organizationId =
    req.nextUrl.searchParams.get("organizationId")?.trim() || ctx.organizationId;

  if (organizationId !== ctx.organizationId) {
    return NextResponse.json(
      { ok: false, code: "ORG_MISMATCH", message: "组织上下文不匹配" },
      { status: 403 },
    );
  }

  const summary = await getWorkspaceSummary(organizationId, ctx.id);

  recordProductAnalytics({
    event: "workspace_entered",
    userId: ctx.id,
    organizationId,
  });

  return NextResponse.json({
    ok: true,
    summary,
    user: {
      id: ctx.id,
      email: ctx.email,
      name: ctx.name,
    },
    membership: ctx.membership,
  });
}
