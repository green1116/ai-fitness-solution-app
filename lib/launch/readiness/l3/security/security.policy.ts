/**
 * Launch L3 — Security policy
 */

import { SECURITY_POLICY_SCOPES } from "../runtime/runtime.constants";
import { getRuntime } from "../runtime/runtime.status";
import type {
  DefineSecurityPolicyInput,
  SecurityPolicy,
  SecurityPolicyScope,
} from "./security.types";

const policies = new Map<string, SecurityPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: SecurityPolicy): SecurityPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function defineSecurityPolicy(
  input: DefineSecurityPolicyInput,
): SecurityPolicy {
  const name = input.name.trim();
  const runtimeId = input.runtimeId.trim();
  if (!name) throw new Error("securityPolicy.name is required");
  if (!runtimeId) throw new Error("securityPolicy.runtimeId is required");
  if (!getRuntime(runtimeId)) {
    throw new Error(`runtime not found: ${runtimeId}`);
  }
  if (!(SECURITY_POLICY_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid security policy scope: ${input.scope}`);
  }

  const id = input.id?.trim() || createId("l3pol");
  if (policies.has(id)) {
    throw new Error(`security policy already exists: ${id}`);
  }

  const enforced = input.enforced !== false;
  const policy: SecurityPolicy = {
    id,
    runtimeId,
    name,
    scope: input.scope,
    enforced,
    detail: `scope=${input.scope} enforced=${enforced}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getSecurityPolicy(id: string): SecurityPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listSecurityPolicies(filter?: {
  runtimeId?: string;
  scope?: SecurityPolicyScope;
}): SecurityPolicy[] {
  let result = [...policies.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((p) => p.runtimeId === rid);
  }
  if (filter?.scope) result = result.filter((p) => p.scope === filter.scope);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearSecurityPolicies(): void {
  policies.clear();
}
