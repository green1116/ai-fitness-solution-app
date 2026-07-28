/**
 * Product M14 — Intelligence policy rule registry (soft graphKeyRef)
 */

import {
  INTELLIGENCE_POLICY_CONSTRAINTS,
  INTELLIGENCE_POLICY_ENFORCEMENTS,
  INTELLIGENCE_POLICY_RULE_STATUSES,
} from "./policy.constants";
import { getIntelligencePolicy } from "./policy.registry";
import type {
  IntelligencePolicyRule,
  IntelligencePolicyRuleStatus,
  RegisterIntelligencePolicyRuleInput,
  UpdateIntelligencePolicyRuleStatusInput,
} from "./policy.types";

const rules = new Map<string, IntelligencePolicyRule>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRule(rule: IntelligencePolicyRule): IntelligencePolicyRule {
  return { ...rule, metadata: { ...rule.metadata } };
}

export function registerIntelligencePolicyRule(
  input: RegisterIntelligencePolicyRuleInput,
): IntelligencePolicyRule {
  const policyId = input.policyId.trim();
  const ruleKey = input.ruleKey.trim().toUpperCase();
  const graphKeyRef = input.graphKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!policyId) throw new Error("rule.policyId is required");
  if (!ruleKey) throw new Error("rule.ruleKey is required");
  if (!graphKeyRef) throw new Error("rule.graphKeyRef is required");
  if (!summary) throw new Error("rule.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("rule.sequence must be a positive integer");
  }
  if (
    !(INTELLIGENCE_POLICY_CONSTRAINTS as readonly string[]).includes(
      input.constraint,
    )
  ) {
    throw new Error(`invalid rule constraint: ${input.constraint}`);
  }
  if (
    !(INTELLIGENCE_POLICY_ENFORCEMENTS as readonly string[]).includes(
      input.enforcement,
    )
  ) {
    throw new Error(`invalid rule enforcement: ${input.enforcement}`);
  }

  const policy = getIntelligencePolicy(policyId);
  if (!policy) throw new Error(`policy not found: ${policyId}`);
  if (policy.status !== "ACTIVE" && policy.status !== "DRAFT") {
    throw new Error(`policy not editable: ${policyId}`);
  }

  const duplicateKey = [...rules.values()].find(
    (r) => r.policyId === policyId && r.ruleKey === ruleKey,
  );
  if (duplicateKey) throw new Error(`ruleKey already exists: ${ruleKey}`);

  const duplicateSeq = [...rules.values()].find(
    (r) => r.policyId === policyId && r.sequence === input.sequence,
  );
  if (duplicateSeq) {
    throw new Error(`rule sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("intpolrule");
  if (rules.has(id)) throw new Error(`rule already exists: ${id}`);

  const now = nowIso();
  const rule: IntelligencePolicyRule = {
    id,
    policyId,
    ruleKey,
    sequence: input.sequence,
    status: INTELLIGENCE_POLICY_RULE_STATUSES[0],
    constraint: input.constraint,
    enforcement: input.enforcement,
    graphKeyRef,
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  rules.set(id, rule);
  return cloneRule(rule);
}

export function updateIntelligencePolicyRuleStatus(
  input: UpdateIntelligencePolicyRuleStatusInput,
): IntelligencePolicyRule {
  const ruleId = input.ruleId.trim();
  if (!ruleId) throw new Error("rule.ruleId is required");
  if (
    !(INTELLIGENCE_POLICY_RULE_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid rule status: ${input.status}`);
  }

  const existing = rules.get(ruleId);
  if (!existing) throw new Error(`rule not found: ${ruleId}`);

  const updated: IntelligencePolicyRule = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  rules.set(ruleId, updated);
  return cloneRule(updated);
}

export function getIntelligencePolicyRule(
  id: string,
): IntelligencePolicyRule | undefined {
  const rule = rules.get(id.trim());
  return rule ? cloneRule(rule) : undefined;
}

export function listIntelligencePolicyRules(filter?: {
  policyId?: string;
  status?: IntelligencePolicyRuleStatus;
}): IntelligencePolicyRule[] {
  let result = [...rules.values()];
  if (filter?.policyId) {
    const policyId = filter.policyId.trim();
    result = result.filter((r) => r.policyId === policyId);
  }
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.sequence - b.sequence || a.ruleKey.localeCompare(b.ruleKey))
    .map(cloneRule);
}

export function clearIntelligencePolicyRules(): void {
  rules.clear();
}
