import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import { canAccessDashboardView, DashboardAccessError } from "@/lib/dashboard/dashboard.service";
import {
  autoRefreshKPIs,
  getDashboardStreamEvents,
} from "@/lib/dashboard/dashboard.service";

export async function GET(req: NextRequest) {
  try {
    const gate = await runSaasOrgGate(req, "/api/dashboard/stream", undefined, "use_product");
    const role = normalizeOrgRole(gate.role);
    if (!canAccessDashboardView(role, "overview")) {
      throw new DashboardAccessError(`Role ${role} cannot access dashboard stream`);
    }

    const since = req.nextUrl.searchParams.get("since") ?? undefined;
    const refresh = req.nextUrl.searchParams.get("refresh") === "1";

    if (refresh) {
      autoRefreshKPIs(gate.organizationId);
    }

    const events = getDashboardStreamEvents(since);
    return NextResponse.json({
      ok: true,
      traceId: gate.traceId,
      events,
      count: events.length,
    });
  } catch (err) {
    if (err instanceof DashboardAccessError) {
      return NextResponse.json(
        { ok: false, code: err.code, message: err.message },
        { status: err.status },
      );
    }
    return saasGateErrorResponse(err);
  }
}
