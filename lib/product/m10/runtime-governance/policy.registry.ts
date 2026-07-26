/**
 * Product M10 — AI Runtime Governance policy registry
 */

import {
  AI_RUNTIME_GOVERNANCE_POLICY_KINDS,
  AI_RUNTIME_GOVERNANCE_POLICY_STATUSES,
} from "./governance.constants";
import type {
  AiRuntimeGovernancePolicy,
  AiRuntimeGovernancePolicyKind,
  AiRuntimeGovernancePolicyStatus,
  RegisterAiRuntimeGovernancePolicyInput,
  UpdateAiRuntimeGovernancePolicyStatusInput,
} from "./governance.types";

const policies = new Map<string, AiRuntimeGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: AiRuntimeGovernancePolicy,
): AiRuntimeGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerAiRuntimeGovernancePolicy(
  input: RegisterAiRuntimeGovernancePolicyInput,
): AiRuntimeGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const resourceKeyRef = input.resourceKeyRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!resourceKeyRef) throw new Error("policy.resourceKeyRef is required");
  if (
    !(AI_RUNTIME_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const id = input.id?.trim() || createId("airtgpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: AiRuntimeGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: AI_RUNTIME_GOVERNANCE_POLICY_STATUSES[0],
    title,
    resourceKeyRef,
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  policies.set(id, policy);
  keys.set(policyKey, id);
  return clonePolicy(policy);
}

export function updateAiRuntimeGovernancePolicyStatus(
  input: UpdateAiRuntimeGovernancePolicyStatusInput,
): AiRuntimeGovernancePolicy {
  const policyId = input.policyId.trim();
  if (!policyId) throw new Error("policy.policyId is required");
  if (
    !(AI_RUNTIME_GOVERNANCE_POLICY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid policy status: ${input.status}`);
  }

  const existing = policies.get(policyId);
  if (!existing) throw new Error(`policy not found: ${policyId}`);

  const updated: AiRuntimeGovernancePolicy = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  policies.set(policyId, updated);
  return clonePolicy(updated);
}

export function getAiRuntimeGovernancePolicy(
  id: string,
): AiRuntimeGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listAiRuntimeGovernancePolicies(filter?: {
  kind?: AiRuntimeGovernancePolicyKind;
  status?: AiRuntimeGovernancePolicyStatus;
}): AiRuntimeGovernancePolicy[] {
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

export function clearAiRuntimeGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
