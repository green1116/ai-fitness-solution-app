/**
 * E11-P7 — Global Policy Engine
 * Evaluates cross-layer policies: admission, isolation, autonomous, governance
 */

import { evaluateAdmission } from "../governance/governance.admission";
import { captureGovernanceMetrics } from "../governance/governance.metrics";
import { resolveActionPolicy } from "../autonomous/autonomous.policy";
import { getIsolationPolicyByTenant } from "../tenant/tenant.policy";
import { getTenant } from "../tenant/tenant.namespace";
import {
  CONTROL_PLANE_SCOPES,
  GLOBAL_POLICY_ENFORCEMENT,
  GLOBAL_POLICY_KINDS,
} from "./control-plane.constants";
import type {
  ControlPlaneScope,
  CreateGlobalPolicyInput,
  GlobalPolicy,
  GlobalPolicyEnforcement,
  GlobalPolicyEvaluation,
  GlobalPolicyKind,
} from "./control-plane.types";

const policies = new Map<string, GlobalPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: GlobalPolicy): GlobalPolicy {
  return {
    ...policy,
    rules: { ...policy.rules },
    metadata: { ...policy.metadata },
  };
}

export function createGlobalPolicy(
  input: CreateGlobalPolicyInput,
): GlobalPolicy {
  const name = input.name.trim();
  if (!name) throw new Error("policy.name is required");

  const kind = input.kind;
  if (!(GLOBAL_POLICY_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid global policy kind: ${kind}`);
  }

  const enforcement = input.enforcement ?? "ENFORCE";
  if (!(GLOBAL_POLICY_ENFORCEMENT as readonly string[]).includes(enforcement)) {
    throw new Error(`invalid policy enforcement: ${enforcement}`);
  }

  const scope = input.scope ?? "GLOBAL";
  if (!(CONTROL_PLANE_SCOPES as readonly string[]).includes(scope)) {
    throw new Error(`invalid policy scope: ${scope}`);
  }

  const id = input.id?.trim() || createId("gpolicy");
  if (policies.has(id)) throw new Error(`global policy already exists: ${id}`);

  const policy: GlobalPolicy = {
    id,
    name,
    kind,
    enforcement,
    scope,
    tenantId: input.tenantId?.trim() || undefined,
    organizationId: input.organizationId?.trim() || undefined,
    rules: { ...(input.rules ?? {}) },
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getGlobalPolicy(id: string): GlobalPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listGlobalPolicies(filter?: {
  kind?: GlobalPolicyKind;
  scope?: ControlPlaneScope;
  tenantId?: string;
}): GlobalPolicy[] {
  let result = [...policies.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.scope) result = result.filter((p) => p.scope === filter.scope);
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter(
      (p) => p.tenantId === tid || p.scope === "GLOBAL",
    );
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function evaluateGlobalPolicy(input: {
  kind: GlobalPolicyKind;
  tenantId?: string;
  runtimeId?: string;
  resourceId?: string;
  amount?: number;
}): GlobalPolicyEvaluation {
  const tenantId = input.tenantId?.trim();
  const applicable = listGlobalPolicies({
    kind: input.kind,
    tenantId,
  }).filter(
    (p) =>
      p.enforcement !== "DISABLED" &&
      (p.scope === "GLOBAL" ||
        (p.scope === "TENANT" && p.tenantId === tenantId)),
  );

  const policy = applicable[0];
  if (!policy) {
    return {
      policyId: "none",
      kind: input.kind,
      allowed: true,
      enforcement: "AUDIT",
      reason: "no policy registered — default allow",
      evaluatedAt: nowIso(),
    };
  }

  if (policy.enforcement === "AUDIT") {
    return {
      policyId: policy.id,
      kind: input.kind,
      allowed: true,
      enforcement: policy.enforcement,
      reason: "audit-only policy",
      evaluatedAt: nowIso(),
    };
  }

  let allowed = true;
  let reason = "policy satisfied";

  switch (input.kind) {
    case "ADMISSION": {
      if (!tenantId || !input.resourceId) {
        allowed = false;
        reason = "admission requires tenantId and resourceId";
        break;
      }
      const admission = evaluateAdmission({
        tenantId,
        resourceId: input.resourceId,
        runtimeId: input.runtimeId,
        amount: input.amount ?? 1,
        priority: "NORMAL",
      });
      allowed = admission.decision === "ADMIT";
      reason = admission.reason;
      break;
    }
    case "ISOLATION": {
      if (!tenantId) {
        allowed = false;
        reason = "isolation requires tenantId";
        break;
      }
      const tenant = getTenant(tenantId);
      if (!tenant || tenant.status !== "ACTIVE") {
        allowed = false;
        reason = `tenant not ACTIVE: ${tenantId}`;
        break;
      }
      const isolation = getIsolationPolicyByTenant(tenantId);
      if (!isolation) {
        reason = "no isolation policy — tenant active";
        break;
      }
      if (isolation.denyCrossTenant) {
        reason = `isolation mode=${isolation.mode} cross-tenant denied`;
      }
      break;
    }
    case "AUTONOMOUS": {
      const autoPolicy = resolveActionPolicy(tenantId);
      if (!autoPolicy) {
        reason = "no autonomous policy — manual default";
        break;
      }
      allowed = autoPolicy.mode !== "MANUAL";
      reason = `autonomous mode=${autoPolicy.mode}`;
      break;
    }
    case "GOVERNANCE": {
      const metrics = captureGovernanceMetrics();
      const maxUtil =
        typeof policy.rules.maxUtilization === "number"
          ? policy.rules.maxUtilization
          : 0.95;
      allowed = metrics.averageUtilization <= maxUtil;
      reason = allowed
        ? `utilization ${metrics.averageUtilization.toFixed(2)} <= ${maxUtil}`
        : `utilization ${metrics.averageUtilization.toFixed(2)} exceeds ${maxUtil}`;
      break;
    }
    case "COMPLIANCE": {
      const requireIsolation =
        policy.rules.requireIsolation !== false;
      if (requireIsolation && tenantId) {
        const isolation = getIsolationPolicyByTenant(tenantId);
        allowed = Boolean(isolation);
        reason = allowed
          ? "isolation policy present"
          : "isolation policy required but missing";
      }
      break;
    }
    default:
      reason = "unknown policy kind";
  }

  return {
    policyId: policy.id,
    kind: input.kind,
    allowed,
    enforcement: policy.enforcement as GlobalPolicyEnforcement,
    reason,
    evaluatedAt: nowIso(),
  };
}

export function clearGlobalPolicies(): void {
  policies.clear();
}
