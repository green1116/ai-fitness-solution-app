/**
 * Product M15 — Evolution governance policy registry (definition only)
 */

import { EVOLUTION_GOVERNANCE_POLICY_KINDS } from "./evolution.constants";
import { getEvolutionTrackByKey } from "./evolution.registry";
import type {
  EvolutionGovernancePolicy,
  EvolutionGovernancePolicyKind,
  EvolutionGovernancePolicyStatus,
  RegisterEvolutionGovernancePolicyInput,
} from "./evolution.types";

const policies = new Map<string, EvolutionGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: EvolutionGovernancePolicy,
): EvolutionGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerEvolutionGovernancePolicy(
  input: RegisterEvolutionGovernancePolicyInput,
): EvolutionGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const trackKeyRef = input.trackKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!trackKeyRef) throw new Error("policy.trackKeyRef is required");
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(EVOLUTION_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const track = getEvolutionTrackByKey(trackKeyRef);
  if (!track) throw new Error(`track not found: ${trackKeyRef}`);
  if (track.status !== "ACTIVE" && track.status !== "DRAFT") {
    throw new Error(`track not governable: ${trackKeyRef}`);
  }

  const id = input.id?.trim() || createId("evogov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: EvolutionGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    trackKeyRef,
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

export function getEvolutionGovernancePolicy(
  id: string,
): EvolutionGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listEvolutionGovernancePolicies(filter?: {
  kind?: EvolutionGovernancePolicyKind;
  status?: EvolutionGovernancePolicyStatus;
}): EvolutionGovernancePolicy[] {
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

export function clearEvolutionGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
