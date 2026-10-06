import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate } from "@/lib/saas/api-gate";
import {
  listActiveOrganizationPriceReferences,
  setOrganizationPriceReference,
} from "@/lib/services/organization-price-reference.service";

import {
  canManagePriceReferences,
  PRICE_REFERENCES_ENDPOINT,
  priceReferenceErrorResponse,
  priceReferenceForbiddenResponse,
  type PriceReferenceRouteContext,
} from "./shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Active price references of the gate organization, for any product user. */
export async function GET(req: NextRequest) {
  const ctx: PriceReferenceRouteContext = {};
  try {
    const queryOrg = String(req.nextUrl.searchParams.get("organizationId") ?? "").trim();
    const gate = await runSaasOrgGate(
      req,
      PRICE_REFERENCES_ENDPOINT,
      queryOrg ? { organizationId: queryOrg } : undefined,
    );
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;

    const references = await listActiveOrganizationPriceReferences(gate.organizationId);
    return NextResponse.json({ ok: true, references, traceId: gate.traceId });
  } catch (err: unknown) {
    return priceReferenceErrorResponse(err, ctx, "组织价目表加载失败");
  }
}

/** Set one subcategory × tier cell (create, update or reactivate); OWNER / ADMIN only. */
export async function PUT(req: NextRequest) {
  const ctx: PriceReferenceRouteContext = {};
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const gate = await runSaasOrgGate(req, PRICE_REFERENCES_ENDPOINT, body ?? undefined);
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;
    if (!canManagePriceReferences(gate.role)) {
      return priceReferenceForbiddenResponse(gate.traceId);
    }

    const { reference, created } = await setOrganizationPriceReference({
      organizationId: gate.organizationId,
      userId: gate.userId,
      body,
    });
    return NextResponse.json(
      { ok: true, reference, traceId: gate.traceId },
      { status: created ? 201 : 200 },
    );
  } catch (err: unknown) {
    return priceReferenceErrorResponse(err, ctx, "组织价目保存失败");
  }
}
