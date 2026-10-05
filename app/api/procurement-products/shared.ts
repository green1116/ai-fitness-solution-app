import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import {
  ProcurementProductConflictError,
  ProcurementProductInputError,
  ProcurementProductNotFoundError,
} from "@/lib/services/procurement-product.service";

export const PROCUREMENT_PRODUCTS_ENDPOINT = "/api/procurement-products";

export type ProcurementRouteContext = {
  organizationId?: string;
  userId?: string;
  traceId?: string;
};

/** Only OWNER / ADMIN maintain organization procurement products (no separate RBAC capability). */
export function canManageProcurementProducts(role: string): boolean {
  const normalized = normalizeOrgRole(role);
  return normalized === "OWNER" || normalized === "ADMIN";
}

export function procurementForbiddenResponse(traceId: string) {
  return NextResponse.json(
    {
      ok: false,
      code: "PROCUREMENT_PRODUCT_FORBIDDEN",
      message: "仅组织所有者或管理员可维护采购库产品",
      traceId,
    },
    { status: 403 },
  );
}

export function procurementErrorResponse(
  err: unknown,
  ctx: ProcurementRouteContext,
  fallbackMessage: string,
) {
  if (
    err instanceof ProcurementProductInputError ||
    err instanceof ProcurementProductNotFoundError ||
    err instanceof ProcurementProductConflictError
  ) {
    return NextResponse.json(
      { ok: false, code: err.code, message: err.message, traceId: ctx.traceId },
      { status: err.status },
    );
  }
  if (isKnownApiError(err)) {
    return handleApiError(err, {
      traceId: ctx.traceId ?? "unknown",
      endpoint: PROCUREMENT_PRODUCTS_ENDPOINT,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });
  }
  console.error("[procurement-products]", err);
  return NextResponse.json(
    { ok: false, message: fallbackMessage, traceId: ctx.traceId },
    { status: 500 },
  );
}
