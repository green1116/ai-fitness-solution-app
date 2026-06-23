import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { buildSystemHealthReport } from "@/lib/portal/v60/health/system-health.engine";
import { recordPlatformEvent } from "@/lib/portal/v60/observability/platform-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const health = await buildSystemHealthReport();
  recordPlatformEvent({
    kind: "health",
    name: "system_health_check",
    source: "production/health",
    organizationId: ctx.organizationId,
    userId: ctx.id,
    severity: health.overall === "healthy" ? "info" : "warn",
  });

  return NextResponse.json({ ok: true, health });
}
