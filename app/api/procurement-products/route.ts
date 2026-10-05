import { NextRequest, NextResponse } from "next/server";

import { runSaasOrgGate } from "@/lib/saas/api-gate";
import {
  createProcurementProduct,
  listProcurementProducts,
} from "@/lib/services/procurement-product.service";

import {
  canManageProcurementProducts,
  PROCUREMENT_PRODUCTS_ENDPOINT,
  procurementErrorResponse,
  procurementForbiddenResponse,
  type ProcurementRouteContext,
} from "./shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Active products for any product user; inactive ones only for OWNER / ADMIN. */
export async function GET(req: NextRequest) {
  const ctx: ProcurementRouteContext = {};
  try {
    const queryOrg = String(req.nextUrl.searchParams.get("organizationId") ?? "").trim();
    const gate = await runSaasOrgGate(
      req,
      PROCUREMENT_PRODUCTS_ENDPOINT,
      queryOrg ? { organizationId: queryOrg } : undefined,
    );
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;
    const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "1";
    if (includeInactive && !canManageProcurementProducts(gate.role)) {
      return procurementForbiddenResponse(gate.traceId);
    }

    const products = await listProcurementProducts({
      organizationId: gate.organizationId,
      includeInactive,
    });
    return NextResponse.json({ ok: true, products, traceId: gate.traceId });
  } catch (err: unknown) {
    return procurementErrorResponse(err, ctx, "采购库产品加载失败");
  }
}

export async function POST(req: NextRequest) {
  const ctx: ProcurementRouteContext = {};
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const gate = await runSaasOrgGate(req, PROCUREMENT_PRODUCTS_ENDPOINT, body ?? undefined);
    ctx.organizationId = gate.organizationId;
    ctx.userId = gate.userId;
    ctx.traceId = gate.traceId;
    if (!canManageProcurementProducts(gate.role)) {
      return procurementForbiddenResponse(gate.traceId);
    }

    const product = await createProcurementProduct({
      organizationId: gate.organizationId,
      userId: gate.userId,
      body,
    });
    return NextResponse.json({ ok: true, product, traceId: gate.traceId }, { status: 201 });
  } catch (err: unknown) {
    return procurementErrorResponse(err, ctx, "采购库产品创建失败");
  }
}
