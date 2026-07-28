/**
 * Product M15 — Evolution feedback governance policy registry (definition only)
 */

import { EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS } from "./feedback.constants";
import { getEvolutionFeedbackByKey } from "./feedback.registry";
import type {
  EvolutionFeedbackGovernancePolicy,
  EvolutionFeedbackGovernancePolicyKind,
  EvolutionFeedbackGovernancePolicyStatus,
  RegisterEvolutionFeedbackGovernancePolicyInput,
} from "./feedback.types";

const policies = new Map<string, EvolutionFeedbackGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: EvolutionFeedbackGovernancePolicy,
): EvolutionFeedbackGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerEvolutionFeedbackGovernancePolicy(
  input: RegisterEvolutionFeedbackGovernancePolicyInput,
): EvolutionFeedbackGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const feedbackKeyRef = input.feedbackKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!feedbackKeyRef) throw new Error("policy.feedbackKeyRef is required");
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const feedback = getEvolutionFeedbackByKey(feedbackKeyRef);
  if (!feedback) throw new Error(`feedback not found: ${feedbackKeyRef}`);
  if (feedback.status !== "ACTIVE" && feedback.status !== "DRAFT") {
    throw new Error(`feedback not governable: ${feedbackKeyRef}`);
  }

  const id = input.id?.trim() || createId("evofbgov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: EvolutionFeedbackGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    feedbackKeyRef,
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

export function getEvolutionFeedbackGovernancePolicy(
  id: string,
): EvolutionFeedbackGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listEvolutionFeedbackGovernancePolicies(filter?: {
  kind?: EvolutionFeedbackGovernancePolicyKind;
  status?: EvolutionFeedbackGovernancePolicyStatus;
}): EvolutionFeedbackGovernancePolicy[] {
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

export function clearEvolutionFeedbackGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
