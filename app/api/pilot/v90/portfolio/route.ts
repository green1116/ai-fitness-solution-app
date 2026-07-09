import { NextResponse } from "next/server";

import { buildPortfolioDashboard } from "@/lib/pilot/v90";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const useCache = new URL(req.url).searchParams.get("cache") === "1";

    try {
      const dashboard = buildPortfolioDashboard(ctx.organizationId, { useCache });
      return NextResponse.json({ ok: true, dashboard, readOnly: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "PORTFOLIO_FAILED";
      return NextResponse.json({ ok: false, code: message, message }, { status: 500 });
    }
  });
}
