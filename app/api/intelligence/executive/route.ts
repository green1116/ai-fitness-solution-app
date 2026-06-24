import { NextResponse } from "next/server";
import { buildExecutiveDashboard } from "@/lib/portal/v59/aggregation/executive.intelligence";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("executive", async (ctx) => {
    const executive = await buildExecutiveDashboard(ctx.organizationId!, ctx.id);
    return NextResponse.json({ ok: true, executive });
  });
}
