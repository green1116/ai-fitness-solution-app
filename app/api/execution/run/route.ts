import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import { runAutonomousExecution, monitorExecutionResult } from "@/lib/ai-execution/execution.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const gate = await runSaasOrgGate(req, "/api/execution/run", body, "manage_billing");
    const role = normalizeOrgRole(gate.role);

    if (role === "MEMBER") {
      return NextResponse.json(
        { ok: false, code: "EXECUTION_ACCESS_DENIED", message: "OWNER or ADMIN required" },
        { status: 403 },
      );
    }

    const result = await runAutonomousExecution(gate.organizationId, gate.traceId);
    const monitor = monitorExecutionResult(gate.organizationId);

    return NextResponse.json({
      ok: true,
      traceId: gate.traceId,
      plan: result.plan,
      results: result.results,
      monitor,
    });
  } catch (err) {
    return saasGateErrorResponse(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const gate = await runSaasOrgGate(req, "/api/execution/run", undefined, "manage_billing");
    const monitor = monitorExecutionResult(gate.organizationId);
    return NextResponse.json({ ok: true, traceId: gate.traceId, monitor });
  } catch (err) {
    return saasGateErrorResponse(err);
  }
}
