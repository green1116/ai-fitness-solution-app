/**
 * Product M11 — Knowledge policy definition registry (in-memory)
 */

import {
  KNOWLEDGE_POLICY_KINDS,
  KNOWLEDGE_POLICY_STATUSES,
} from "./policy.constants";
import type {
  KnowledgePolicy,
  KnowledgePolicyKind,
  KnowledgePolicyStatus,
  RegisterKnowledgePolicyInput,
  UpdateKnowledgePolicyStatusInput,
} from "./policy.types";

const policies = new Map<string, KnowledgePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: KnowledgePolicy): KnowledgePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerKnowledgePolicy(
  input: RegisterKnowledgePolicyInput,
): KnowledgePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!summary) throw new Error("policy.summary is required");
  if (!(KNOWLEDGE_POLICY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const id = input.id?.trim() || createId("knwpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: KnowledgePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: KNOWLEDGE_POLICY_STATUSES[0],
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

export function updateKnowledgePolicyStatus(
  input: UpdateKnowledgePolicyStatusInput,
): KnowledgePolicy {
  const policyId = input.policyId.trim();
  if (!policyId) throw new Error("policy.policyId is required");
  if (!(KNOWLEDGE_POLICY_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid policy status: ${input.status}`);
  }

  const existing = policies.get(policyId);
  if (!existing) throw new Error(`policy not found: ${policyId}`);

  const updated: KnowledgePolicy = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  policies.set(policyId, updated);
  return clonePolicy(updated);
}

export function getKnowledgePolicy(id: string): KnowledgePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listKnowledgePolicies(filter?: {
  kind?: KnowledgePolicyKind;
  status?: KnowledgePolicyStatus;
}): KnowledgePolicy[] {
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

export function clearKnowledgePolicies(): void {
  policies.clear();
  keys.clear();
}
