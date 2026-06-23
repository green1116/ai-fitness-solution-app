import { NextResponse } from "next/server";
import { buildTelemetryReport } from "@/lib/portal/v62/telemetry/pilot-telemetry.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async (ctx) => {
    const report = buildTelemetryReport(ctx.organizationId ?? undefined);
    return NextResponse.json({ ok: true, report });
  });
}
