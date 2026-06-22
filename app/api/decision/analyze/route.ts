import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import { runDecisionPipeline } from "@/lib/ai-decision/decision.service";

export async function GET(req: NextRequest) {
  try {
    const gate = await runSaasOrgGate(req, "/api/decision/analyze", undefined, "manage_billing");
    const role = normalizeOrgRole(gate.role);
    if (role === "MEMBER") {
      return NextResponse.json(
        { ok: false, code: "DECISION_ACCESS_DENIED", message: "OWNER or ADMIN required" },
        { status: 403 },
      );
    }

    const execute = req.nextUrl.searchParams.get("execute") === "1";
    const result = await runDecisionPipeline({
      organizationId: gate.organizationId,
      executeActions: execute,
    });

    return NextResponse.json({ ok: true, traceId: gate.traceId, ...result });
  } catch (err) {
    return saasGateErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
