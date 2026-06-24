import { NextResponse } from "next/server";
import { buildSupportReadinessReport } from "@/lib/portal/v62/support/support-readiness.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async () => {
    const report = buildSupportReadinessReport();
    return NextResponse.json({ ok: true, report });
  });
}
