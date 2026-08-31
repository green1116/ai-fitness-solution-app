import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { trackDealProgress, closeDealWon, closeDealLost } from "@/lib/crm/crm.service";
import { openDealForOpportunity } from "@/lib/crm/deal/deal.service";
import {
  CRM_PLATFORM_MUTATION_BLOCKED_MESSAGE,
  isCrmPlatformMutationAllowed,
} from "@/lib/crm/crm.mutation-auth";
import {
  CRM_TENANT_BLOCKED_MESSAGE,
  isCrmEntityOwnedByOrg,
} from "@/lib/crm/crm.tenant-guard";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import type { DealStatus } from "@/lib/crm/types";

function tenantBlockedResponse(traceId: string) {
  return NextResponse.json(
    { ok: false, message: CRM_TENANT_BLOCKED_MESSAGE, traceId },
    { status: 403 },
  );
}

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/crm/deals", body);
    traceId = gate.traceId;

    const action = String(body?.action ?? "create");

    if (action === "track") {
      const dealId = String(body?.dealId ?? "").trim();
      const status = String(body?.status ?? "").toUpperCase() as DealStatus;
      if (!dealId || !status) {
        return NextResponse.json({ ok: false, message: "dealId and status required", traceId }, { status: 400 });
      }
      if (
        !(await isCrmEntityOwnedByOrg({
          entity: "deal",
          entityId: dealId,
          organizationId: gate.organizationId,
        }))
      ) {
        return tenantBlockedResponse(traceId);
      }
      const deal = await trackDealProgress({ dealId, status, userId: gate.userId });
      return NextResponse.json({ ok: true, deal, traceId });
    }

    if (action === "close_won") {
      if (!isCrmPlatformMutationAllowed(gate.email)) {
        return NextResponse.json(
          { ok: false, message: CRM_PLATFORM_MUTATION_BLOCKED_MESSAGE, traceId },
          { status: 403 },
        );
      }
      const dealId = String(body?.dealId ?? "").trim();
      if (
        !(await isCrmEntityOwnedByOrg({
          entity: "deal",
          entityId: dealId,
          organizationId: gate.organizationId,
        }))
      ) {
        return tenantBlockedResponse(traceId);
      }
      const deal = await closeDealWon({ dealId, userId: gate.userId });
      return NextResponse.json({ ok: true, deal, traceId });
    }

    if (action === "close_lost") {
      const dealId = String(body?.dealId ?? "").trim();
      if (
        !(await isCrmEntityOwnedByOrg({
          entity: "deal",
          entityId: dealId,
          organizationId: gate.organizationId,
        }))
      ) {
        return tenantBlockedResponse(traceId);
      }
      const deal = await closeDealLost({ dealId, userId: gate.userId });
      return NextResponse.json({ ok: true, deal, traceId });
    }

    const opportunityId = String(body?.opportunityId ?? "").trim();
    if (!opportunityId) {
      return NextResponse.json({ ok: false, message: "opportunityId required", traceId }, { status: 400 });
    }

    if (!isCrmPlatformMutationAllowed(gate.email)) {
      return NextResponse.json(
        { ok: false, message: CRM_PLATFORM_MUTATION_BLOCKED_MESSAGE, traceId },
        { status: 403 },
      );
    }

    if (
      !(await isCrmEntityOwnedByOrg({
        entity: "opp",
        entityId: opportunityId,
        organizationId: gate.organizationId,
      }))
    ) {
      return tenantBlockedResponse(traceId);
    }

    const { deal } = await openDealForOpportunity({
      opportunityId,
      amount: body?.amount ? Number(body.amount) : undefined,
      userId: gate.userId,
    });

    return NextResponse.json({ ok: true, deal, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/crm/deals" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Deal operation failed", traceId },
      { status: 500 },
    );
  }
}
