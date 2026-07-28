/**
 * Product M14 — Intelligence governance policy registry (definition only)
 */

import { INTELLIGENCE_GOVERNANCE_POLICY_KINDS } from "./intelligence.constants";
import { getIntelligenceLensByKey } from "./intelligence.registry";
import type {
  IntelligenceGovernancePolicy,
  IntelligenceGovernancePolicyKind,
  IntelligenceGovernancePolicyStatus,
  RegisterIntelligenceGovernancePolicyInput,
} from "./intelligence.types";

const policies = new Map<string, IntelligenceGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: IntelligenceGovernancePolicy,
): IntelligenceGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerIntelligenceGovernancePolicy(
  input: RegisterIntelligenceGovernancePolicyInput,
): IntelligenceGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const lensKeyRef = input.lensKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!lensKeyRef) throw new Error("policy.lensKeyRef is required");
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(INTELLIGENCE_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const lens = getIntelligenceLensByKey(lensKeyRef);
  if (!lens) throw new Error(`lens not found: ${lensKeyRef}`);
  if (lens.status !== "ACTIVE" && lens.status !== "DRAFT") {
    throw new Error(`lens not governable: ${lensKeyRef}`);
  }

  const id = input.id?.trim() || createId("intgov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: IntelligenceGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    lensKeyRef,
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

export function getIntelligenceGovernancePolicy(
  id: string,
): IntelligenceGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listIntelligenceGovernancePolicies(filter?: {
  kind?: IntelligenceGovernancePolicyKind;
  status?: IntelligenceGovernancePolicyStatus;
}): IntelligenceGovernancePolicy[] {
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

export function clearIntelligenceGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
