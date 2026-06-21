import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { createDeal, trackDealProgress, closeDealWon, closeDealLost } from "@/lib/crm/crm.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import type { DealStatus } from "@/lib/crm/types";

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
      const deal = await trackDealProgress({ dealId, status, userId: gate.userId });
      return NextResponse.json({ ok: true, deal, traceId });
    }

    if (action === "close_won") {
      const dealId = String(body?.dealId ?? "").trim();
      const deal = await closeDealWon({ dealId, userId: gate.userId });
      return NextResponse.json({ ok: true, deal, traceId });
    }

    if (action === "close_lost") {
      const dealId = String(body?.dealId ?? "").trim();
      const deal = await closeDealLost({ dealId, userId: gate.userId });
      return NextResponse.json({ ok: true, deal, traceId });
    }

    const opportunityId = String(body?.opportunityId ?? "").trim();
    if (!opportunityId) {
      return NextResponse.json({ ok: false, message: "opportunityId required", traceId }, { status: 400 });
    }

    const deal = await createDeal({
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
