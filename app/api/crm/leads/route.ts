import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { createLead, promoteLeadToOpportunity } from "@/lib/crm/crm.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { getCustomerById } from "@/lib/crm/customer/customer.service";

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/crm/leads", body);
    traceId = gate.traceId;

    const customerId = String(body?.customerId ?? "").trim();
    if (!customerId) {
      return NextResponse.json({ ok: false, message: "customerId required", traceId }, { status: 400 });
    }

    const customer = await getCustomerById(customerId, gate.organizationId);
    if (!customer) {
      return NextResponse.json({ ok: false, message: "Customer not found", traceId }, { status: 404 });
    }

    if (body?.action === "promote") {
      const leadId = String(body?.leadId ?? "").trim();
      if (!leadId) {
        return NextResponse.json({ ok: false, message: "leadId required", traceId }, { status: 400 });
      }
      const result = await promoteLeadToOpportunity({
        leadId,
        value: body?.value ? Number(body.value) : undefined,
        userId: gate.userId,
      });
      return NextResponse.json({ ok: true, ...result, traceId });
    }

    const lead = await createLead({
      customerId,
      source: body?.source,
      score: body?.score ? Number(body.score) : undefined,
      userId: gate.userId,
    });

    return NextResponse.json({ ok: true, lead, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/crm/leads" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Lead operation failed", traceId },
      { status: 500 },
    );
  }
}
