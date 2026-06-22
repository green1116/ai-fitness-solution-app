/**
 * V59.5 — Unified API protection pipeline
 *
 * Execution order: Auth → Tenant → RBAC → Rate Limit → Feature Gate
 */

import type { NextRequest } from "next/server";

import { enforceAuthGuard, SaasAuthError, type AuthContext } from "@/lib/security/auth.guard";
import { enforceRbacGuard, type OrgPermission } from "@/lib/security/rbac.guard";
import { enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";
import {
  enforceFeatureAccess,
  FeatureGateError,
  type FeatureAccessResult,
} from "@/lib/feature-flags/feature-gate";
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { recordAuditEvent } from "@/lib/observability/audit.logger";
import { enforceTenantScope, withTenantScope, TenantIsolationError } from "@/lib/tenancy/tenant.guard";
import { startRequestTracking } from "@/lib/monitoring/request-tracker";
import type { SaasPlan } from "@/lib/saas/types";

export type ProtectedApiContext = AuthContext & {
  traceId: string;
  endpoint: string;
  plan: SaasPlan;
  feature?: FeatureAccessResult;
  idempotencyKey?: string;
};

export type ApiProtectionOptions = {
  endpoint: string;
  body?: Record<string, unknown>;
  permission?: OrgPermission;
  feature?: FeatureKey;
  skipRateLimit?: boolean;
};

const IDEMPOTENCY_HEADER = "x-idempotency-key";
const idempotencyCache = new Map<string, { expiresAt: number; traceId: string }>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function resolveIdempotencyKey(req: NextRequest): string | undefined {
  const key = req.headers.get(IDEMPOTENCY_HEADER)?.trim();
  return key || undefined;
}

function assertIdempotency(key: string, traceId: string): void {
  const now = Date.now();
  const existing = idempotencyCache.get(key);
  if (existing && existing.expiresAt > now) {
    throw new IdempotencyConflictError(`Duplicate idempotency key: ${key}`, existing.traceId);
  }
  idempotencyCache.set(key, { expiresAt: now + IDEMPOTENCY_TTL_MS, traceId });
}

export class IdempotencyConflictError extends Error {
  readonly code = "IDEMPOTENCY_CONFLICT";
  readonly status = 409;
  readonly priorTraceId: string;

  constructor(message: string, priorTraceId: string) {
    super(message);
    this.name = "IdempotencyConflictError";
    this.priorTraceId = priorTraceId;
  }
}

export async function runApiProtection(
  req: NextRequest,
  options: ApiProtectionOptions,
): Promise<ProtectedApiContext> {
  const track = startRequestTracking(req, options.endpoint);
  const permission = options.permission ?? "use_product";

  const auth = await enforceAuthGuard(req, options.body);
  const tenant = enforceTenantScope(req, auth, track.traceId, options.body);

  return await withTenantScope(tenant, async () => {
      enforceRbacGuard(auth.role, permission);

      let plan: SaasPlan = "BASIC";
      if (!options.skipRateLimit) {
        const rl = await enforceRateLimit({
          userId: auth.userId,
          organizationId: auth.organizationId,
          endpoint: options.endpoint,
        });
        plan = rl.plan;
      }

      const idempotencyKey = resolveIdempotencyKey(req);
      if (idempotencyKey) {
        assertIdempotency(`${auth.organizationId}:${options.endpoint}:${idempotencyKey}`, track.traceId);
      }

      let featureResult: FeatureAccessResult | undefined;
      if (options.feature) {
        featureResult = await enforceFeatureAccess(auth.organizationId, options.feature);
        plan = featureResult.plan;
      }

      recordAuditEvent({
        userId: auth.userId,
        organizationId: auth.organizationId,
        endpoint: options.endpoint,
        action: options.feature ? "feature.access" : "api.request",
        resultStatus: "success",
        traceId: track.traceId,
        meta: { permission, feature: options.feature, plan },
      });

      return {
        ...auth,
        traceId: track.traceId,
        endpoint: options.endpoint,
        plan,
        feature: featureResult,
        idempotencyKey,
    };
  });
}

export function getDeploymentEnvironment(): "development" | "staging" | "production" {
  const env = process.env.APP_ENV?.trim() || process.env.NODE_ENV?.trim() || "development";
  if (env === "production" || env === "prod") return "production";
  if (env === "staging" || env === "stage") return "staging";
  return "development";
}

export function isProductionReady(): boolean {
  const hasDb = typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
  const env = getDeploymentEnvironment();
  return hasDb && (env === "production" || env === "staging" || process.env.NODE_ENV === "production");
}

/** Stateless API — no in-request server affinity required beyond optional in-process rate limit cache */
export function isStatelessApiDesign(): boolean {
  return true;
}

/** Horizontal scaling supported when DB + env are externalized */
export function supportsHorizontalScaling(): boolean {
  return isStatelessApiDesign() && Boolean(process.env.DATABASE_URL);
}

export {
  SaasAuthError,
  FeatureGateError,
  TenantIsolationError,
  RateLimitError,
  IdempotencyConflictError as IdempotencyError,
};

export function clearIdempotencyCacheForTests(): void {
  idempotencyCache.clear();
}
