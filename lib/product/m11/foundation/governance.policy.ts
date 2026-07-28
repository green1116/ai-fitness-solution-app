/**
 * Product M11 — Knowledge governance policy registry (definition only)
 */

import { KNOWLEDGE_GOVERNANCE_POLICY_KINDS } from "./knowledge.constants";
import { getKnowledgeEntityByKey } from "./knowledge.registry";
import type {
  KnowledgeGovernancePolicy,
  KnowledgeGovernancePolicyKind,
  KnowledgeGovernancePolicyStatus,
  RegisterKnowledgeGovernancePolicyInput,
} from "./knowledge.types";

const policies = new Map<string, KnowledgeGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: KnowledgeGovernancePolicy,
): KnowledgeGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerKnowledgeGovernancePolicy(
  input: RegisterKnowledgeGovernancePolicyInput,
): KnowledgeGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const entityKeyRef = input.entityKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!entityKeyRef) throw new Error("policy.entityKeyRef is required");
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(KNOWLEDGE_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const entity = getKnowledgeEntityByKey(entityKeyRef);
  if (!entity) throw new Error(`entity not found: ${entityKeyRef}`);
  if (entity.status !== "ACTIVE" && entity.status !== "DRAFT") {
    throw new Error(`entity not governable: ${entityKeyRef}`);
  }

  const id = input.id?.trim() || createId("knwgov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: KnowledgeGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    entityKeyRef,
    ruleRef,
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  policies.set(id, policy);
  keys.set(policyKey, id);
  return clonePolicy(policy);
}

export function getKnowledgeGovernancePolicy(
  id: string,
): KnowledgeGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listKnowledgeGovernancePolicies(filter?: {
  kind?: KnowledgeGovernancePolicyKind;
  status?: KnowledgeGovernancePolicyStatus;
}): KnowledgeGovernancePolicy[] {
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

export function clearKnowledgeGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
