/**
 * E12-P7 — Commercial Policy
 */

import { getProductIdentity } from "../identity/product.identity";
import {
  COMMERCIAL_POLICY_KINDS,
  COMMERCIAL_POLICY_STATUSES,
} from "./commercial.constants";
import type {
  CommercialPolicy,
  CommercialPolicyEvaluation,
  CommercialPolicyKind,
  CommercialPolicyStatus,
  CreateCommercialPolicyInput,
} from "./commercial.types";

const policies = new Map<string, CommercialPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: CommercialPolicy): CommercialPolicy {
  return {
    ...policy,
    rules: { ...policy.rules },
    metadata: { ...policy.metadata },
  };
}

export function createCommercialPolicy(
  input: CreateCommercialPolicyInput,
): CommercialPolicy {
  const productId = input.productId.trim();
  const name = input.name.trim();
  const kind = input.kind;

  if (!name) throw new Error("policy.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }
  if (!(COMMERCIAL_POLICY_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid policy kind: ${kind}`);
  }

  const status = input.status ?? "ACTIVE";
  if (!(COMMERCIAL_POLICY_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid policy status: ${status}`);
  }

  const id = input.id?.trim() || createId("cpolicy");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const policy: CommercialPolicy = {
    id,
    productId,
    kind,
    name,
    status,
    rules: { ...(input.rules ?? {}) },
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getCommercialPolicy(id: string): CommercialPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listCommercialPolicies(filter?: {
  productId?: string;
  kind?: CommercialPolicyKind;
  status?: CommercialPolicyStatus;
}): CommercialPolicy[] {
  let result = [...policies.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function evaluateCommercialPolicy(input: {
  policyId: string;
  context?: Record<string, unknown>;
}): CommercialPolicyEvaluation {
  const policy = getCommercialPolicy(input.policyId);
  if (!policy) {
    return {
      policyId: input.policyId,
      decision: "DENY",
      reason: "policy not found",
      evaluatedAt: nowIso(),
    };
  }
  if (policy.status !== "ACTIVE") {
    return {
      policyId: policy.id,
      decision: "DENY",
      reason: `policy not ACTIVE: ${policy.status}`,
      evaluatedAt: nowIso(),
    };
  }

  const maxDiscount = policy.rules.maxDiscountPercent;
  if (
    typeof maxDiscount === "number" &&
    typeof input.context?.discountPercent === "number" &&
    input.context.discountPercent > maxDiscount
  ) {
    return {
      policyId: policy.id,
      decision: "DENY",
      reason: `discount exceeds max ${maxDiscount}%`,
      evaluatedAt: nowIso(),
    };
  }

  return {
    policyId: policy.id,
    decision: "ALLOW",
    reason: "policy satisfied",
    evaluatedAt: nowIso(),
  };
}

export function clearCommercialPolicies(): void {
  policies.clear();
}
