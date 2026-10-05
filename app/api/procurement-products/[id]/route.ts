import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate } from "@/lib/saas/api-gate";
import {
  deactivateProcurementProduct,
  updateProcurementProduct,
} from "@/lib/services/procurement-product.service";

import {
  canManageProcurementProducts,
  PROCUREMENT_PRODUCTS_ENDPOINT,
  procurementErrorResponse,
  procurementForbiddenResponse,
  type ProcurementRouteContext,
} from "../shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function productIdRequired(traceId: string) {
  return NextResponse.json(
    { ok: false, code: "PROCUREMENT_PRODUCT_ID_REQUIRED", message: "缺少采购库产品 id", traceId },
    { status: 400 },
  );
}

/** Update an active product; every effective change increments its revision. */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const ctx: ProcurementRouteContext = {};
  try {
    const { id: rawId } = await context.params;
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const gate = await runSaasOrgGate(req, PROCUREMENT_PRODUCTS_ENDPOINT, body ?? undefined);
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;
    if (!canManageProcurementProducts(gate.role)) {
      return procurementForbiddenResponse(gate.traceId);
    }
    const id = String(rawId ?? "").trim();
    if (!id) return productIdRequired(gate.traceId);

    const product = await updateProcurementProduct({
      organizationId: gate.organizationId,
      userId: gate.userId,
      id,
      body,
    });
    return NextResponse.json({ ok: true, product, traceId: gate.traceId });
  } catch (err: unknown) {
    return procurementErrorResponse(err, ctx, "采购库产品修改失败");
  }
}

/** Soft deactivation only; the row and every Quote snapshot of it are kept. */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const ctx: ProcurementRouteContext = {};
  try {
    const { id: rawId } = await context.params;
    const queryOrg = String(req.nextUrl.searchParams.get("organizationId") ?? "").trim();
    const gate = await runSaasOrgGate(
      req,
      PROCUREMENT_PRODUCTS_ENDPOINT,
      queryOrg ? { organizationId: queryOrg } : undefined,
    );
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;
    if (!canManageProcurementProducts(gate.role)) {
      return procurementForbiddenResponse(gate.traceId);
    }
    const id = String(rawId ?? "").trim();
    if (!id) return productIdRequired(gate.traceId);

    const product = await deactivateProcurementProduct({
      organizationId: gate.organizationId,
      userId: gate.userId,
      id,
    });
    return NextResponse.json({ ok: true, product, traceId: gate.traceId });
  } catch (err: unknown) {
    return procurementErrorResponse(err, ctx, "采购库产品停用失败");
  }
}
