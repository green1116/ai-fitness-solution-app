import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate } from "@/lib/saas/api-gate";
import { deactivateOrganizationPriceReference } from "@/lib/services/organization-price-reference.service";

import {
  canManagePriceReferences,
  PRICE_REFERENCES_ENDPOINT,
  priceReferenceErrorResponse,
  priceReferenceForbiddenResponse,
  type PriceReferenceRouteContext,
} from "../shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** Soft deactivation only; Budget rows priced from this reference keep their snapshot. */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const ctx: PriceReferenceRouteContext = {};
  try {
    const { id: rawId } = await context.params;
    const queryOrg = String(req.nextUrl.searchParams.get("organizationId") ?? "").trim();
    const gate = await runSaasOrgGate(
      req,
      PRICE_REFERENCES_ENDPOINT,
      queryOrg ? { organizationId: queryOrg } : undefined,
    );
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;
    if (!canManagePriceReferences(gate.role)) {
      return priceReferenceForbiddenResponse(gate.traceId);
    }
    const id = String(rawId ?? "").trim();
    if (!id) {
      return NextResponse.json(
        { ok: false, code: "PRICE_REFERENCE_INVALID", message: "缺少组织价目 id", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const reference = await deactivateOrganizationPriceReference({
      organizationId: gate.organizationId,
      userId: gate.userId,
      id,
    });
    return NextResponse.json({ ok: true, reference, traceId: gate.traceId });
  } catch (err: unknown) {
    return priceReferenceErrorResponse(err, ctx, "组织价目停用失败");
  }
}
