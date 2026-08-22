import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { createOpportunity, updateOpportunityStage } from "@/lib/crm/crm.service";
import {
  CRM_TENANT_BLOCKED_MESSAGE,
  isCrmEntityOwnedByOrg,
} from "@/lib/crm/crm.tenant-guard";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { getCustomerById } from "@/lib/crm/customer/customer.service";
import type { OpportunityStageName } from "@/lib/crm/opportunity/opportunity.stage";

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/crm/opportunities", body);
    traceId = gate.traceId;

    if (body?.action === "update_stage") {
      const opportunityId = String(body?.opportunityId ?? "").trim();
      const stage = String(body?.stage ?? "").toUpperCase() as OpportunityStageName;
      if (!opportunityId || !stage) {
        return NextResponse.json(
          { ok: false, message: "opportunityId and stage required", traceId },
          { status: 400 },
        );
      }
      if (
        !(await isCrmEntityOwnedByOrg({
          entity: "opp",
          entityId: opportunityId,
          organizationId: gate.organizationId,
        }))
      ) {
        return NextResponse.json(
          { ok: false, message: CRM_TENANT_BLOCKED_MESSAGE, traceId },
          { status: 403 },
        );
      }
      const opportunity = await updateOpportunityStage({
        opportunityId,
        stage,
        userId: gate.userId,
      });
      return NextResponse.json({ ok: true, opportunity, traceId });
    }

    const customerId = String(body?.customerId ?? "").trim();
    if (!customerId) {
      return NextResponse.json({ ok: false, message: "customerId required", traceId }, { status: 400 });
    }

    const customer = await getCustomerById(customerId, gate.organizationId);
    if (!customer) {
      return NextResponse.json({ ok: false, message: "Customer not found", traceId }, { status: 404 });
    }

    const opportunity = await createOpportunity({
      customerId,
      leadId: body?.leadId,
      stage: body?.stage,
      value: body?.value ? Number(body.value) : undefined,
      userId: gate.userId,
    });

    return NextResponse.json({ ok: true, opportunity, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/crm/opportunities" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Opportunity operation failed", traceId },
      { status: 500 },
    );
  }
}
