/**
 * Product Delivery — Retry policy registry (policy only, no network)
 */

import { DELIVERY_RETRY_BACKOFFS } from "../management/management.constants";
import { getDeliveryRequest } from "../request/request.registry";
import type {
  AttachDeliveryRetryPolicyInput,
  DeliveryRetryPolicy,
} from "./retry.types";

const policies = new Map<string, DeliveryRetryPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: DeliveryRetryPolicy): DeliveryRetryPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function attachDeliveryRetryPolicy(
  input: AttachDeliveryRetryPolicyInput,
): DeliveryRetryPolicy {
  const requestId = input.requestId.trim();
  if (!requestId) throw new Error("retry.requestId is required");
  if (!Number.isFinite(input.maxAttempts) || input.maxAttempts < 1) {
    throw new Error("retry.maxAttempts must be >= 1");
  }
  if (!Number.isFinite(input.baseDelayMs) || input.baseDelayMs < 0) {
    throw new Error("retry.baseDelayMs must be >= 0");
  }
  if (!(DELIVERY_RETRY_BACKOFFS as readonly string[]).includes(input.backoff)) {
    throw new Error(`invalid retry backoff: ${input.backoff}`);
  }
  if (!getDeliveryRequest(requestId)) {
    throw new Error(`request not found: ${requestId}`);
  }

  const duplicate = [...policies.values()].find(
    (p) => p.requestId === requestId,
  );
  if (duplicate) throw new Error(`retry policy already exists: ${requestId}`);

  const id = input.id?.trim() || createId("dlvrty");
  if (policies.has(id)) throw new Error(`retry policy already exists: ${id}`);

  const policy: DeliveryRetryPolicy = {
    id,
    requestId,
    maxAttempts: Math.floor(input.maxAttempts),
    backoff: input.backoff,
    baseDelayMs: Math.floor(input.baseDelayMs),
    detail: `max=${Math.floor(input.maxAttempts)} backoff=${input.backoff}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getDeliveryRetryPolicy(
  id: string,
): DeliveryRetryPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listDeliveryRetryPolicies(filter?: {
  requestId?: string;
}): DeliveryRetryPolicy[] {
  let result = [...policies.values()];
  if (filter?.requestId) {
    const requestId = filter.requestId.trim();
    result = result.filter((p) => p.requestId === requestId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearDeliveryRetryPolicies(): void {
  policies.clear();
}
