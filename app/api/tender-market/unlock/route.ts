import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import { evaluateTemplateUnlock } from "@/lib/tender-market/tender-market.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const gate = await runSaasOrgGate(req, "/api/tender-market/unlock", body, "manage_billing");
    const role = normalizeOrgRole(gate.role);

    const templateId = String(body?.templateId ?? "").trim();
    if (!templateId) {
      return NextResponse.json({ ok: false, message: "templateId required" }, { status: 400 });
    }

    const unlock = await evaluateTemplateUnlock({
      templateId,
      organizationId: gate.organizationId,
      userId: gate.userId,
    });

    return NextResponse.json({
      ok: true,
      traceId: gate.traceId,
      unlock,
      billingPath: "/api/billing/create-checkout-session",
      memberBlocked: role === "MEMBER" && unlock.paywall.showPaywall,
    });
  } catch (err) {
    return saasGateErrorResponse(err);
  }
}
