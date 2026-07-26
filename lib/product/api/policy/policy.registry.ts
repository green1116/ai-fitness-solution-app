/**
 * Product API — Policy registry (no gateway / no rate limiting)
 */

import { API_POLICY_MODES } from "../management/management.constants";
import { getApi } from "../registry/api.registry";
import type { ApiPolicy, AttachApiPolicyInput } from "./policy.types";

const policies = new Map<string, ApiPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: ApiPolicy): ApiPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function attachApiPolicy(input: AttachApiPolicyInput): ApiPolicy {
  const apiId = input.apiId.trim();
  if (!apiId) throw new Error("policy.apiId is required");
  if (!(API_POLICY_MODES as readonly string[]).includes(input.mode)) {
    throw new Error(`invalid policy mode: ${input.mode}`);
  }
  if (!getApi(apiId)) throw new Error(`api not found: ${apiId}`);

  const duplicate = [...policies.values()].find((p) => p.apiId === apiId);
  if (duplicate) throw new Error(`policy already exists: ${apiId}`);

  const id = input.id?.trim() || createId("apipol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const policy: ApiPolicy = {
    id,
    apiId,
    mode: input.mode,
    requireVersion: input.requireVersion === true,
    detail: `mode=${input.mode} requireVersion=${input.requireVersion === true}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getApiPolicy(id: string): ApiPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listApiPolicies(filter?: { apiId?: string }): ApiPolicy[] {
  let result = [...policies.values()];
  if (filter?.apiId) {
    const apiId = filter.apiId.trim();
    result = result.filter((p) => p.apiId === apiId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearApiPolicies(): void {
  policies.clear();
}
