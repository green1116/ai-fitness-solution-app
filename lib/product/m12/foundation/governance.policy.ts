/**
 * Product M12 — Agent governance policy registry (definition only)
 */

import { AGENT_GOVERNANCE_POLICY_KINDS } from "./agent.constants";
import { getAgentDefinitionByKey } from "./agent.registry";
import type {
  AgentGovernancePolicy,
  AgentGovernancePolicyKind,
  AgentGovernancePolicyStatus,
  RegisterAgentGovernancePolicyInput,
} from "./agent.types";

const policies = new Map<string, AgentGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: AgentGovernancePolicy,
): AgentGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerAgentGovernancePolicy(
  input: RegisterAgentGovernancePolicyInput,
): AgentGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const agentKeyRef = input.agentKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!agentKeyRef) throw new Error("policy.agentKeyRef is required");
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(AGENT_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const agent = getAgentDefinitionByKey(agentKeyRef);
  if (!agent) throw new Error(`agent not found: ${agentKeyRef}`);
  if (agent.status !== "ACTIVE" && agent.status !== "DRAFT") {
    throw new Error(`agent not governable: ${agentKeyRef}`);
  }

  const id = input.id?.trim() || createId("agtgov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: AgentGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    agentKeyRef,
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

export function getAgentGovernancePolicy(
  id: string,
): AgentGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listAgentGovernancePolicies(filter?: {
  kind?: AgentGovernancePolicyKind;
  status?: AgentGovernancePolicyStatus;
}): AgentGovernancePolicy[] {
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

export function clearAgentGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
