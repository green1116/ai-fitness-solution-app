/**
 * Commercialization P7 — Governance policy
 */

import { GOVERNANCE_POLICY_STATUSES } from "./governance.constants";
import { getGovernance } from "./governance.registry";
import type {
  DefinePolicyInput,
  GovernancePolicy,
  GovernancePolicyStatus,
} from "./governance.types";

const policies = new Map<string, GovernancePolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: GovernancePolicy): GovernancePolicy {
  return { ...policy };
}

export function defineGovernancePolicy(
  input: DefinePolicyInput,
): GovernancePolicy {
  const title = input.title.trim();
  const governanceId = input.governanceId.trim();
  if (!title) throw new Error("policy.title is required");
  if (!governanceId) throw new Error("policy.governanceId is required");
  if (!getGovernance(governanceId)) {
    throw new Error(`governance not found: ${governanceId}`);
  }
  if (!Number.isFinite(input.threshold) || input.threshold < 0) {
    throw new Error("policy.threshold must be a non-negative number");
  }

  const status: GovernancePolicyStatus = input.status ?? "ACTIVE";
  if (!(GOVERNANCE_POLICY_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid policy status: ${status}`);
  }

  const id = input.id?.trim() || createId("pol");
  if (policies.has(id)) {
    throw new Error(`governance policy already exists: ${id}`);
  }

  const now = nowIso();
  const policy: GovernancePolicy = {
    id,
    governanceId,
    title,
    status,
    threshold: Math.round(input.threshold),
    detail: `status=${status} threshold=${Math.round(input.threshold)}`,
    createdAt: now,
    updatedAt: now,
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getGovernancePolicy(
  id: string,
): GovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listGovernancePolicies(filter?: {
  governanceId?: string;
  status?: GovernancePolicyStatus;
}): GovernancePolicy[] {
  let result = [...policies.values()];
  if (filter?.governanceId) {
    const gid = filter.governanceId.trim();
    result = result.filter((p) => p.governanceId === gid);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearGovernancePolicies(): void {
  policies.clear();
}
