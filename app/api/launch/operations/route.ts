import { NextResponse } from "next/server";
import { buildOperationsDashboard } from "@/lib/portal/v61/operations/operations-dashboard.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async (ctx) => {
    const operations = await buildOperationsDashboard(ctx.organizationId!, ctx.id);
    return NextResponse.json({ ok: true, operations });
  });
}
