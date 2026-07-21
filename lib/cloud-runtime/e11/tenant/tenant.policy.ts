/**
 * E11-P3 — Isolation Policy
 */

import { ISOLATION_POLICY_MODES } from "./tenant.constants";
import { getTenant } from "./tenant.namespace";
import type {
  CreateIsolationPolicyInput,
  IsolationPolicy,
  IsolationPolicyMode,
} from "./tenant.types";

const policies = new Map<string, IsolationPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: IsolationPolicy): IsolationPolicy {
  return {
    ...policy,
    allowedRuntimeKinds: [...policy.allowedRuntimeKinds],
    metadata: { ...policy.metadata },
  };
}

export function createIsolationPolicy(
  input: CreateIsolationPolicyInput,
): IsolationPolicy {
  const tenantId = input.tenantId.trim();
  if (!tenantId) throw new Error("policy.tenantId is required");
  if (!getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }

  const mode = input.mode ?? "STRICT";
  if (!(ISOLATION_POLICY_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid isolation policy mode: ${mode}`);
  }

  // One policy per tenant
  for (const p of policies.values()) {
    if (p.tenantId === tenantId) {
      throw new Error(`isolation policy already exists for tenant: ${tenantId}`);
    }
  }

  const id = input.id?.trim() || createId("ipolicy");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const denyCrossTenant =
    input.denyCrossTenant ?? (mode === "STRICT" || mode === "SHARED_READONLY");
  const requireOrgMatch =
    input.requireOrgMatch ?? mode === "STRICT";

  const policy: IsolationPolicy = {
    id,
    tenantId,
    mode,
    denyCrossTenant,
    requireOrgMatch,
    allowedRuntimeKinds: [...(input.allowedRuntimeKinds ?? [])],
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getIsolationPolicy(id: string): IsolationPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function getIsolationPolicyByTenant(
  tenantId: string,
): IsolationPolicy | undefined {
  const tid = tenantId.trim();
  for (const p of policies.values()) {
    if (p.tenantId === tid) return clonePolicy(p);
  }
  return undefined;
}

export function listIsolationPolicies(filter?: {
  tenantId?: string;
  mode?: IsolationPolicyMode;
}): IsolationPolicy[] {
  let result = [...policies.values()];
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((p) => p.tenantId === tid);
  }
  if (filter?.mode) {
    result = result.filter((p) => p.mode === filter.mode);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearIsolationPolicies(): void {
  policies.clear();
}
