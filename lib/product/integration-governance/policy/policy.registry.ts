/**
 * Product Integration Governance — policy registry
 */

import {
  INTEGRATION_GOVERNANCE_POLICY_KINDS,
  INTEGRATION_GOVERNANCE_POLICY_STATUSES,
} from "../management/management.constants";
import type {
  IntegrationGovernancePolicy,
  IntegrationGovernancePolicyKind,
  IntegrationGovernancePolicyStatus,
  RegisterIntegrationGovernancePolicyInput,
  UpdateIntegrationGovernancePolicyStatusInput,
} from "./policy.types";

const policies = new Map<string, IntegrationGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: IntegrationGovernancePolicy,
): IntegrationGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerIntegrationGovernancePolicy(
  input: RegisterIntegrationGovernancePolicyInput,
): IntegrationGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const catalogKeyRef = input.catalogKeyRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!catalogKeyRef) throw new Error("policy.catalogKeyRef is required");
  if (
    !(INTEGRATION_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const id = input.id?.trim() || createId("igovpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: IntegrationGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: INTEGRATION_GOVERNANCE_POLICY_STATUSES[0],
    title,
    catalogKeyRef,
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  policies.set(id, policy);
  keys.set(policyKey, id);
  return clonePolicy(policy);
}

export function updateIntegrationGovernancePolicyStatus(
  input: UpdateIntegrationGovernancePolicyStatusInput,
): IntegrationGovernancePolicy {
  const policyId = input.policyId.trim();
  if (!policyId) throw new Error("policy.policyId is required");
  if (
    !(INTEGRATION_GOVERNANCE_POLICY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid policy status: ${input.status}`);
  }

  const existing = policies.get(policyId);
  if (!existing) throw new Error(`policy not found: ${policyId}`);

  const updated: IntegrationGovernancePolicy = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  policies.set(policyId, updated);
  return clonePolicy(updated);
}

export function getIntegrationGovernancePolicy(
  id: string,
): IntegrationGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listIntegrationGovernancePolicies(filter?: {
  kind?: IntegrationGovernancePolicyKind;
  status?: IntegrationGovernancePolicyStatus;
}): IntegrationGovernancePolicy[] {
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

export function clearIntegrationGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
