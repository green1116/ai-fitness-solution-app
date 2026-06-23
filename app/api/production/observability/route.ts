import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { runPermissionAudit } from "@/lib/portal/v60/audit/permission-audit.engine";
import { getPlatformEvents } from "@/lib/portal/v60/observability/platform-events";
import { getReadonlyCacheStats } from "@/lib/portal/v60/cache/readonly-cache";
import { getRecentAuditEvents } from "@/lib/observability/audit.logger";
import { getMetricSnapshot } from "@/lib/observability/metrics.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    observability: {
      platformEvents: getPlatformEvents(50),
      auditEvents: getRecentAuditEvents(30),
      metrics: getMetricSnapshot(),
      cache: getReadonlyCacheStats(),
      permissions: runPermissionAudit(),
    },
  });
}
