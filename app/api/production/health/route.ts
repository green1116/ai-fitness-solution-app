import { NextResponse } from "next/server";
import { buildSystemHealthReport } from "@/lib/portal/v60/health/system-health.engine";
import { recordPlatformEvent } from "@/lib/portal/v60/observability/platform-events";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("production_ops", async (ctx) => {
    const health = await buildSystemHealthReport();
    recordPlatformEvent({
      kind: "health",
      name: "system_health_check",
      source: "production/health",
      organizationId: ctx.organizationId!,
      userId: ctx.id,
      severity: health.overall === "healthy" ? "info" : "warn",
    });
    return NextResponse.json({ ok: true, health });
  });
}
