import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import {
  runAutonomousCompanyCycle,
  getCompanyControllerStatus,
} from "@/lib/autonomous-company/autonomous-company.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const gate = await runSaasOrgGate(req, "/api/autonomous/company", body, "manage_billing");
    const role = normalizeOrgRole(gate.role);

    if (role === "MEMBER") {
      return NextResponse.json(
        { ok: false, code: "AUTONOMOUS_ACCESS_DENIED", message: "OWNER or ADMIN required" },
        { status: 403 },
      );
    }

    const iterations = Math.min(Number(body?.iterations ?? 1), 3);
    const report = await runAutonomousCompanyCycle(gate.organizationId, {
      traceId: gate.traceId,
      iterations,
    });

    return NextResponse.json({
      ok: true,
      traceId: gate.traceId,
      report,
      controller: getCompanyControllerStatus(gate.organizationId),
    });
  } catch (err) {
    return saasGateErrorResponse(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const gate = await runSaasOrgGate(req, "/api/autonomous/company", undefined, "manage_billing");
    const controller = getCompanyControllerStatus(gate.organizationId);
    return NextResponse.json({ ok: true, traceId: gate.traceId, controller });
  } catch (err) {
    return saasGateErrorResponse(err);
  }
}
