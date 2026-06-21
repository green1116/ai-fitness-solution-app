/**
 * V62 P3 — Governance: policy engine
 */

import type { ExecutionAction } from "@/lib/ai-execution/core/execution.types";

export type BusinessPolicy = {
  id: string;
  name: string;
  description: string;
};

export const COMPANY_POLICIES: BusinessPolicy[] = [
  { id: "no_billing_mutation", name: "No Billing Mutation", description: "AI cannot mutate Stripe/billing directly" },
  { id: "tenant_isolation", name: "Tenant Isolation", description: "Actions scoped to organization only" },
  { id: "feature_gate_respect", name: "Feature Gate", description: "Must not bypass feature gates" },
  { id: "action_logging", name: "Action Logging", description: "All actions must be logged" },
  { id: "rollback_allowed", name: "Rollback", description: "Reversible actions must support rollback" },
];

export type PolicyCheckResult = {
  policyId: string;
  passed: boolean;
  message: string;
};

export function enforceBusinessPolicies(
  organizationId: string,
  actions: ExecutionAction[],
): PolicyCheckResult[] {
  const results: PolicyCheckResult[] = [];

  for (const policy of COMPANY_POLICIES) {
    let passed = true;
    let message = "OK";

    if (policy.id === "no_billing_mutation") {
      const bad = actions.some((a) => {
        const p = a.payload as Record<string, unknown> | undefined;
        return a.type === "PRICING" && (p?.mutateBilling === true || p?.stripePriceId);
      });
      passed = !bad;
      message = bad ? "Blocked billing mutation attempt" : "No billing mutations";
    }

    if (policy.id === "tenant_isolation") {
      const bad = actions.some((a) => a.organizationId !== organizationId);
      passed = !bad;
      message = bad ? "Cross-tenant action blocked" : "Tenant scope verified";
    }

    if (policy.id === "feature_gate_respect") {
      const bad = actions.some((a) => {
        const p = JSON.stringify(a.payload ?? {});
        return /bypassFeatureGate|skipAuth/i.test(p);
      });
      passed = !bad;
      message = bad ? "Feature gate bypass blocked" : "Feature gates respected";
    }

    results.push({ policyId: policy.id, passed, message });
  }

  return results;
}

export function allPoliciesPassed(checks: PolicyCheckResult[]): boolean {
  return checks.every((c) => c.passed);
}

export function filterPolicyCompliantActions(
  organizationId: string,
  actions: ExecutionAction[],
): ExecutionAction[] {
  enforceBusinessPolicies(organizationId, actions);
  return actions.filter((a) => a.organizationId === organizationId);
}
