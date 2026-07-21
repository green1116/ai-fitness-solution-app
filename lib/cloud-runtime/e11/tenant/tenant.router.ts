/**
 * E11-P3 — Tenant Runtime Router
 * Routes requests through isolation policy + quota against registry / context
 */

import { getRuntime } from "../registry/cloud.registry";
import { getContext, listContexts } from "../runtime/cloud.context";
import {
  findTenantByRuntime,
  getTenant,
} from "./tenant.namespace";
import { getOrganization } from "./tenant.organization";
import { getIsolationPolicyByTenant } from "./tenant.policy";
import {
  getTenantQuotaByType,
  reserveQuota,
} from "./tenant.quota";
import type {
  TenantRouteRequest,
  TenantRouteResult,
} from "./tenant.types";

function nowIso(): string {
  return new Date().toISOString();
}

function deny(
  request: TenantRouteRequest,
  reason: string,
  decision: TenantRouteResult["decision"] = "DENY",
): TenantRouteResult {
  return {
    decision,
    tenantId: request.tenantId,
    runtimeId: request.runtimeId,
    reason,
    routedAt: nowIso(),
  };
}

/**
 * Evaluate tenant isolation and optionally reserve quota.
 * Does not mutate execution queue — caller uses execution manager after ALLOW.
 */
export function routeTenantRuntime(
  request: TenantRouteRequest,
  options?: { reserve?: boolean },
): TenantRouteResult {
  const tenantId = request.tenantId.trim();
  const runtimeId = request.runtimeId.trim();
  if (!tenantId) return deny(request, "tenantId is required");
  if (!runtimeId) return deny(request, "runtimeId is required");

  const tenant = getTenant(tenantId);
  if (!tenant) return deny(request, `tenant not found: ${tenantId}`);
  if (tenant.status !== "ACTIVE") {
    return deny(request, `tenant not ACTIVE: ${tenantId}`);
  }

  const org = getOrganization(tenant.organizationId);
  if (!org || org.status !== "ACTIVE") {
    return deny(
      request,
      `organization not ACTIVE: ${tenant.organizationId}`,
    );
  }

  if (request.organizationId) {
    const oid = request.organizationId.trim();
    if (oid !== tenant.organizationId) {
      return deny(
        request,
        `organization mismatch: request=${oid} tenant=${tenant.organizationId}`,
      );
    }
  }

  const runtime = getRuntime(runtimeId);
  if (!runtime) {
    return deny(request, `cloud runtime not found: ${runtimeId}`);
  }

  const policy = getIsolationPolicyByTenant(tenantId);
  if (policy) {
    if (policy.requireOrgMatch && request.organizationId) {
      if (request.organizationId.trim() !== tenant.organizationId) {
        return deny(request, "policy requireOrgMatch failed");
      }
    }

    if (policy.allowedRuntimeKinds.length > 0) {
      if (!policy.allowedRuntimeKinds.includes(runtime.kind)) {
        return deny(
          request,
          `runtime kind not allowed: ${runtime.kind}`,
        );
      }
    }

    if (policy.denyCrossTenant) {
      const owner = findTenantByRuntime(runtimeId);
      if (owner && owner.id !== tenantId) {
        return deny(
          request,
          `cross-tenant runtime denied: owned by ${owner.id}`,
        );
      }
      if (!owner && !tenant.runtimeIds.includes(runtimeId)) {
        return deny(
          request,
          `runtime not bound to tenant namespace: ${runtimeId}`,
        );
      }
    } else if (policy.mode === "STRICT") {
      if (!tenant.runtimeIds.includes(runtimeId)) {
        return deny(
          request,
          `runtime not in tenant namespace: ${runtimeId}`,
        );
      }
    }
  } else if (!tenant.runtimeIds.includes(runtimeId)) {
    return deny(
      request,
      `runtime not in tenant namespace: ${runtimeId}`,
    );
  }

  // Optional: verify open/active contexts belong to same runtime (isolation probe)
  const contexts = listContexts({ runtimeId });
  for (const ctx of contexts) {
    if (ctx.status === "CLOSED") continue;
    const live = getContext(ctx.contextId);
    if (live && live.runtimeId !== runtimeId) {
      return deny(request, "context runtime isolation breach");
    }
  }

  const quotaType = request.quotaType ?? "TASK";
  const amount = request.amount ?? 1;
  const quota = getTenantQuotaByType(tenantId, quotaType);
  if (quota && quota.used + amount > quota.limit) {
    return deny(
      request,
      `quota exceeded for ${quotaType}`,
      "QUOTA_EXCEEDED",
    );
  }

  if (options?.reserve !== false && quota) {
    try {
      reserveQuota(tenantId, quotaType, amount);
    } catch (error) {
      return deny(
        request,
        error instanceof Error ? error.message : "quota reserve failed",
        "QUOTA_EXCEEDED",
      );
    }
  }

  return {
    decision: "ALLOW",
    tenantId,
    runtimeId,
    namespaceKey: tenant.namespaceKey,
    reason: "route allowed",
    routedAt: nowIso(),
  };
}
