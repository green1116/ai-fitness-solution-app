/**
 * E09-P2 — Regional Policy Engine
 * Declarative policies bound to regions (reuse regional.types)
 */

import type { Region, RegionalStatus } from "./regional.types";

export const REGIONAL_POLICY_STATUSES = [
  "ACTIVE",
  "DISABLED",
  "DRAFT",
] as const;

export type RegionalPolicyStatus = (typeof REGIONAL_POLICY_STATUSES)[number];

export const REGIONAL_POLICY_OPERATORS = [
  "eq",
  "neq",
  "in",
  "exists",
] as const;

export type RegionalPolicyOperator =
  (typeof REGIONAL_POLICY_OPERATORS)[number];

export type RegionalPolicyRule = {
  field: string;
  operator: RegionalPolicyOperator;
  value?: unknown;
};

export type RegionalPolicy = {
  id: string;
  regionId: string;
  name: string;
  rules: RegionalPolicyRule[];
  priority: number;
  status: RegionalPolicyStatus;
};

export type CreateRegionalPolicyInput = {
  id: string;
  regionId?: string;
  name: string;
  rules: RegionalPolicyRule[];
  priority?: number;
  status?: RegionalPolicyStatus;
};

export type PolicyEvaluationContext = {
  region: Region;
  facts?: Readonly<Record<string, unknown>>;
};

export type PolicyEvaluationResult = {
  policyId: string;
  regionId: string;
  passed: boolean;
  matchedRules: number;
  totalRules: number;
  failedRules: string[];
  reason: string;
};

const policies = new Map<string, RegionalPolicy>();
/** regionId → ordered policy ids */
const regionIndex = new Map<string, string[]>();

function clonePolicy(policy: RegionalPolicy): RegionalPolicy {
  return {
    ...policy,
    rules: policy.rules.map((r) => ({ ...r })),
  };
}

function assertPolicyStatus(
  status: string,
): asserts status is RegionalPolicyStatus {
  if (!(REGIONAL_POLICY_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid policy status: ${status}`);
  }
}

function assertRule(rule: RegionalPolicyRule): void {
  if (!rule.field.trim()) throw new Error("rule.field is required");
  if (
    !(REGIONAL_POLICY_OPERATORS as readonly string[]).includes(rule.operator)
  ) {
    throw new Error(`invalid rule operator: ${rule.operator}`);
  }
}

function indexPolicy(policy: RegionalPolicy): void {
  if (!policy.regionId) return;
  const list = regionIndex.get(policy.regionId) ?? [];
  if (!list.includes(policy.id)) {
    regionIndex.set(policy.regionId, [...list, policy.id]);
  }
}

function unindexPolicy(policy: RegionalPolicy): void {
  if (!policy.regionId) return;
  const list = regionIndex.get(policy.regionId) ?? [];
  const next = list.filter((id) => id !== policy.id);
  if (next.length === 0) regionIndex.delete(policy.regionId);
  else regionIndex.set(policy.regionId, next);
}

function resolveField(
  context: PolicyEvaluationContext,
  field: string,
): unknown {
  const facts = context.facts ?? {};
  if (field in facts) return facts[field];

  switch (field) {
    case "region.id":
      return context.region.id;
    case "region.code":
      return context.region.code;
    case "region.status":
      return context.region.status;
    case "region.name":
      return context.region.name;
    case "region.parentNodeId":
      return context.region.parentGlobalNode.id;
    case "region.parentNodeType":
      return context.region.parentGlobalNode.type;
    default:
      if (field.startsWith("metadata.")) {
        return context.region.metadata[field.slice("metadata.".length)];
      }
      return undefined;
  }
}

function matchRule(
  rule: RegionalPolicyRule,
  context: PolicyEvaluationContext,
): boolean {
  const actual = resolveField(context, rule.field);

  switch (rule.operator) {
    case "exists":
      return actual !== undefined && actual !== null;
    case "eq":
      return actual === rule.value;
    case "neq":
      return actual !== rule.value;
    case "in":
      return Array.isArray(rule.value) && rule.value.includes(actual);
    default:
      return false;
  }
}

/** Create a policy (optionally unbound until attachPolicy). */
export function createPolicy(
  input: CreateRegionalPolicyInput,
): RegionalPolicy {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("policy.id is required");
  if (!name) throw new Error("policy.name is required");
  if (!Array.isArray(input.rules) || input.rules.length === 0) {
    throw new Error("policy.rules must be a non-empty array");
  }
  for (const rule of input.rules) assertRule(rule);

  const status = input.status ?? "DRAFT";
  assertPolicyStatus(status);

  const priority = input.priority ?? 100;
  if (!Number.isFinite(priority)) {
    throw new Error("policy.priority must be a finite number");
  }

  if (policies.has(id)) {
    throw new Error(`policy already exists: ${id}`);
  }

  const policy: RegionalPolicy = {
    id,
    regionId: input.regionId?.trim() ?? "",
    name,
    rules: input.rules.map((r) => ({ ...r })),
    priority,
    status,
  };

  policies.set(id, policy);
  if (policy.regionId) indexPolicy(policy);
  return clonePolicy(policy);
}

/** Attach (or re-bind) a policy to a region and activate it. */
export function attachPolicy(
  policyId: string,
  region: Region,
): RegionalPolicy {
  const policy = policies.get(policyId.trim());
  if (!policy) throw new Error(`policy not found: ${policyId}`);
  if (!region.id.trim()) throw new Error("region.id is required");

  unindexPolicy(policy);

  const attached: RegionalPolicy = {
    ...policy,
    regionId: region.id.trim(),
    status: policy.status === "DRAFT" ? "ACTIVE" : policy.status,
    rules: policy.rules.map((r) => ({ ...r })),
  };

  policies.set(attached.id, attached);
  indexPolicy(attached);
  return clonePolicy(attached);
}

/** Evaluate an attached ACTIVE policy against a region (+ optional facts). */
export function evaluatePolicy(
  policyId: string,
  context: PolicyEvaluationContext,
): PolicyEvaluationResult {
  const policy = policies.get(policyId.trim());
  if (!policy) {
    return {
      policyId: policyId.trim(),
      regionId: context.region.id,
      passed: false,
      matchedRules: 0,
      totalRules: 0,
      failedRules: [],
      reason: "policy not found",
    };
  }

  if (!policy.regionId) {
    return {
      policyId: policy.id,
      regionId: context.region.id,
      passed: false,
      matchedRules: 0,
      totalRules: policy.rules.length,
      failedRules: [],
      reason: "policy not attached to a region",
    };
  }

  if (policy.regionId !== context.region.id) {
    return {
      policyId: policy.id,
      regionId: policy.regionId,
      passed: false,
      matchedRules: 0,
      totalRules: policy.rules.length,
      failedRules: [],
      reason: `policy region mismatch: ${policy.regionId} ≠ ${context.region.id}`,
    };
  }

  if (policy.status !== "ACTIVE") {
    return {
      policyId: policy.id,
      regionId: policy.regionId,
      passed: false,
      matchedRules: 0,
      totalRules: policy.rules.length,
      failedRules: [],
      reason: `policy status is ${policy.status}`,
    };
  }

  const failedRules: string[] = [];
  let matchedRules = 0;

  for (const rule of policy.rules) {
    if (matchRule(rule, context)) {
      matchedRules += 1;
    } else {
      failedRules.push(`${rule.field} ${rule.operator}`);
    }
  }

  const passed = failedRules.length === 0;
  return {
    policyId: policy.id,
    regionId: policy.regionId,
    passed,
    matchedRules,
    totalRules: policy.rules.length,
    failedRules,
    reason: passed
      ? `policy ${policy.name} passed (${matchedRules}/${policy.rules.length})`
      : `policy ${policy.name} failed (${failedRules.length} rules)`,
  };
}

export function removePolicy(id: string): boolean {
  const policy = policies.get(id.trim());
  if (!policy) return false;
  unindexPolicy(policy);
  policies.delete(policy.id);
  return true;
}

export function getPolicy(id: string): RegionalPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listPoliciesForRegion(regionId: string): RegionalPolicy[] {
  const ids = regionIndex.get(regionId.trim()) ?? [];
  return ids
    .map((id) => policies.get(id))
    .filter((p): p is RegionalPolicy => Boolean(p))
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))
    .map(clonePolicy);
}

/** Evaluate all ACTIVE policies for a region by ascending priority. */
export function evaluateRegionPolicies(
  region: Region,
  facts?: Readonly<Record<string, unknown>>,
): PolicyEvaluationResult[] {
  return listPoliciesForRegion(region.id)
    .filter((p) => p.status === "ACTIVE")
    .map((p) => evaluatePolicy(p.id, { region, facts }));
}

export function clearPolicies(): void {
  policies.clear();
  regionIndex.clear();
}

export type { RegionalStatus };
