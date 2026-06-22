/**
 * V59 SaaS — Unified API request gate
 * V59.5 — Production hardening pipeline integrated
 *
 * Auth → Tenant → RBAC → Rate Limit → Feature Gate → (track usage after handler)
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError, mapErrorToApiError } from "@/lib/error/api-error.mapper";
import {
  enforceFeatureAccess,
  FeatureGateError,
  type FeatureAccessResult,
} from "@/lib/feature-flags/feature-gate";
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { SaasAuthError, type AuthContext } from "@/lib/auth/auth.service";
import { runApiProtection, type ProtectedApiContext } from "@/lib/security/api-protection";
import { trackUsage } from "@/lib/usage/usage-tracker.service";
import type { UsageType } from "@/lib/saas/types";

export type SaasGateContext = AuthContext & {
  feature: FeatureAccessResult;
  traceId: string;
  plan: ProtectedApiContext["plan"];
};

const FEATURE_USAGE_MAP: Partial<Record<FeatureKey, UsageType>> = {
  canGenerateQuote: "QUOTE",
  canGenerateBudget: "BUDGET",
  canGenerateTender: "TENDER",
  canExportPDF: "PDF",
};

const ENDPOINT_MAP: Partial<Record<FeatureKey, string>> = {
  canGenerateQuote: "/api/quote/generate",
  canGenerateBudget: "/api/budget/calculate",
  canGenerateTender: "/api/tender/generate",
};

export async function runSaasApiGate(
  req: NextRequest,
  feature: FeatureKey,
  body?: Record<string, unknown>,
): Promise<SaasGateContext> {
  const endpoint = ENDPOINT_MAP[feature] ?? req.nextUrl.pathname;
  const ctx = await runApiProtection(req, {
    endpoint,
    body,
    permission: "use_product",
    feature,
  });

  if (!ctx.feature) {
    throw new FeatureGateError("Feature access not resolved");
  }

  return {
    userId: ctx.userId,
    email: ctx.email,
    organizationId: ctx.organizationId,
    role: ctx.role,
    membership: ctx.membership,
    feature: ctx.feature,
    traceId: ctx.traceId,
    plan: ctx.plan,
  };
}

/** Org-scoped gate without feature check (projects, settings) */
export async function runSaasOrgGate(
  req: NextRequest,
  endpoint: string,
  body?: Record<string, unknown>,
  permission: "use_product" | "manage_billing" | "manage_subscription" | "manage_members" = "use_product",
): Promise<Omit<SaasGateContext, "feature"> & { feature?: FeatureAccessResult }> {
  const ctx = await runApiProtection(req, { endpoint, body, permission });
  return {
    userId: ctx.userId,
    email: ctx.email,
    organizationId: ctx.organizationId,
    role: ctx.role,
    membership: ctx.membership,
    feature: ctx.feature,
    traceId: ctx.traceId,
    plan: ctx.plan,
  };
}

export async function trackFeatureUsage(organizationId: string, feature: FeatureKey) {
  const usageType = FEATURE_USAGE_MAP[feature];
  if (!usageType) return;
  await trackUsage({ organizationId, type: usageType });
}

export function saasGateErrorResponse(err: unknown, traceId?: string): NextResponse {
  const resolvedTraceId = traceId ?? mapErrorToApiError(err, "unknown").traceId;
  if (isKnownApiError(err) || (err instanceof Error && err.name === "IdempotencyConflictError")) {
    return handleApiError(err, { traceId: resolvedTraceId, endpoint: "saas-gate" });
  }
  if (err instanceof SaasAuthError) {
    return NextResponse.json({ ok: false, code: err.code, message: err.message, traceId: resolvedTraceId }, { status: 401 });
  }
  if (err instanceof FeatureGateError) {
    return NextResponse.json({ ok: false, code: err.code, message: err.message, traceId: resolvedTraceId }, { status: 403 });
  }
  return NextResponse.json(
    { ok: false, message: err instanceof Error ? err.message : "Request denied", traceId: resolvedTraceId },
    { status: 500 },
  );
}

export { enforceFeatureAccess, FeatureGateError, SaasAuthError };
export { authenticateRequest } from "@/lib/auth/auth.service";
export { runApiProtection } from "@/lib/security/api-protection";
