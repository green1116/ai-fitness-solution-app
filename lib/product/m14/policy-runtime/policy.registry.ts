/**
 * Product M14 — Intelligence policy definition registry (in-memory)
 */

import {
  INTELLIGENCE_POLICY_KINDS,
  INTELLIGENCE_POLICY_STATUSES,
} from "./policy.constants";
import type {
  IntelligencePolicy,
  IntelligencePolicyKind,
  IntelligencePolicyStatus,
  RegisterIntelligencePolicyInput,
  UpdateIntelligencePolicyStatusInput,
} from "./policy.types";

const policies = new Map<string, IntelligencePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: IntelligencePolicy): IntelligencePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerIntelligencePolicy(
  input: RegisterIntelligencePolicyInput,
): IntelligencePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!summary) throw new Error("policy.summary is required");
  if (
    !(INTELLIGENCE_POLICY_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const id = input.id?.trim() || createId("intpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: IntelligencePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: INTELLIGENCE_POLICY_STATUSES[0],
    title,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  policies.set(id, policy);
  keys.set(policyKey, id);
  return clonePolicy(policy);
}

export function updateIntelligencePolicyStatus(
  input: UpdateIntelligencePolicyStatusInput,
): IntelligencePolicy {
  const policyId = input.policyId.trim();
  if (!policyId) throw new Error("policy.policyId is required");
  if (
    !(INTELLIGENCE_POLICY_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid policy status: ${input.status}`);
  }

  const existing = policies.get(policyId);
  if (!existing) throw new Error(`policy not found: ${policyId}`);

  const updated: IntelligencePolicy = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  policies.set(policyId, updated);
  return clonePolicy(updated);
}

export function getIntelligencePolicy(
  id: string,
): IntelligencePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listIntelligencePolicies(filter?: {
  kind?: IntelligencePolicyKind;
  status?: IntelligencePolicyStatus;
}): IntelligencePolicy[] {
  let result = [...policies.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.policyKey.localeCompare(b.policyKey))
    .map(clonePolicy);
}

export function clearIntelligencePolicies(): void {
  policies.clear();
  keys.clear();
}
