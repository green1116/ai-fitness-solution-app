import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import { runTenderBusinessLoop } from "@/lib/tender-market/tender-market.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const gate = await runSaasOrgGate(req, "/api/tender-market/run", body, "manage_billing");
    const role = normalizeOrgRole(gate.role);

    if (role === "MEMBER") {
      return NextResponse.json(
        { ok: false, code: "TENDER_MARKET_DENIED", message: "OWNER or ADMIN required" },
        { status: 403 },
      );
    }

    const result = runTenderBusinessLoop(gate.traceId);
    return NextResponse.json({ ok: true, traceId: gate.traceId, result });
  } catch (err) {
    return saasGateErrorResponse(err);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
