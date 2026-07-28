/**
 * Product M12 — Agent policy definition registry (in-memory)
 */

import {
  AGENT_POLICY_KINDS,
  AGENT_POLICY_STATUSES,
} from "./policy.constants";
import type {
  AgentPolicy,
  AgentPolicyKind,
  AgentPolicyStatus,
  RegisterAgentPolicyInput,
  UpdateAgentPolicyStatusInput,
} from "./policy.types";

const policies = new Map<string, AgentPolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: AgentPolicy): AgentPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerAgentPolicy(
  input: RegisterAgentPolicyInput,
): AgentPolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!summary) throw new Error("policy.summary is required");
  if (!(AGENT_POLICY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const id = input.id?.trim() || createId("agtpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: AgentPolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: AGENT_POLICY_STATUSES[0],
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

export function updateAgentPolicyStatus(
  input: UpdateAgentPolicyStatusInput,
): AgentPolicy {
  const policyId = input.policyId.trim();
  if (!policyId) throw new Error("policy.policyId is required");
  if (!(AGENT_POLICY_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid policy status: ${input.status}`);
  }

  const existing = policies.get(policyId);
  if (!existing) throw new Error(`policy not found: ${policyId}`);

  const updated: AgentPolicy = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  policies.set(policyId, updated);
  return clonePolicy(updated);
}

export function getAgentPolicy(id: string): AgentPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listAgentPolicies(filter?: {
  kind?: AgentPolicyKind;
  status?: AgentPolicyStatus;
}): AgentPolicy[] {
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

export function clearAgentPolicies(): void {
  policies.clear();
  keys.clear();
}
