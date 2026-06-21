/**
 * V61 P2 — Dashboard API handler helper
 */

import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import { buildDashboardView, DashboardAccessError } from "@/lib/dashboard/dashboard.service";
import type { DashboardView } from "@/lib/dashboard/dashboard.types";

export async function handleDashboardGet(req: NextRequest, view: DashboardView, endpoint: string) {
  try {
    const gate = await runSaasOrgGate(req, endpoint, undefined, "use_product");
    const role = normalizeOrgRole(gate.role);
    const payload = await buildDashboardView(view, gate.organizationId, role);
    return NextResponse.json({ ok: true, traceId: gate.traceId, ...payload });
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
