import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { normalizeOrgRole } from "@/lib/organization/role.service";
import {
  PriceReferenceConflictError,
  PriceReferenceInputError,
  PriceReferenceNotFoundError,
} from "@/lib/services/organization-price-reference.service";

export const PRICE_REFERENCES_ENDPOINT = "/api/organization-price-references";

export type PriceReferenceRouteContext = {
  organizationId?: string;
  userId?: string;
  traceId?: string;
};

/** Only OWNER / ADMIN maintain organization price references (no separate RBAC capability). */
export function canManagePriceReferences(role: string): boolean {
  const normalized = normalizeOrgRole(role);
  return normalized === "OWNER" || normalized === "ADMIN";
}

export function priceReferenceForbiddenResponse(traceId: string) {
  return NextResponse.json(
    {
      ok: false,
      code: "PRICE_REFERENCE_FORBIDDEN",
      message: "仅组织所有者或管理员可维护组织价目表",
      traceId,
    },
    { status: 403 },
  );
}

export function priceReferenceErrorResponse(
  err: unknown,
  ctx: PriceReferenceRouteContext,
  fallbackMessage: string,
) {
  if (
    err instanceof PriceReferenceInputError ||
    err instanceof PriceReferenceNotFoundError ||
    err instanceof PriceReferenceConflictError
  ) {
    return NextResponse.json(
      { ok: false, code: err.code, message: err.message, traceId: ctx.traceId },
      { status: err.status },
    );
  }
  if (isKnownApiError(err)) {
    return handleApiError(err, {
      traceId: ctx.traceId ?? "unknown",
      endpoint: PRICE_REFERENCES_ENDPOINT,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });
  }
  console.error("[organization-price-references]", err);
  return NextResponse.json(
    { ok: false, message: fallbackMessage, traceId: ctx.traceId },
    { status: 500 },
  );
}
