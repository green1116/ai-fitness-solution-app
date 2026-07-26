/**
 * Product Marketplace — Policy registry (no partner / business execution)
 */

import { MARKETPLACE_POLICY_MODES } from "../management/management.constants";
import { getMarketplaceListing } from "../registry/listing.registry";
import type {
  AttachMarketplacePolicyInput,
  MarketplacePolicy,
} from "./policy.types";

const policies = new Map<string, MarketplacePolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: MarketplacePolicy): MarketplacePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function attachMarketplacePolicy(
  input: AttachMarketplacePolicyInput,
): MarketplacePolicy {
  const listingId = input.listingId.trim();
  if (!listingId) throw new Error("policy.listingId is required");
  if (!(MARKETPLACE_POLICY_MODES as readonly string[]).includes(input.mode)) {
    throw new Error(`invalid policy mode: ${input.mode}`);
  }
  if (!getMarketplaceListing(listingId)) {
    throw new Error(`listing not found: ${listingId}`);
  }

  const duplicate = [...policies.values()].find(
    (p) => p.listingId === listingId,
  );
  if (duplicate) throw new Error(`policy already exists: ${listingId}`);

  const id = input.id?.trim() || createId("mktpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const policy: MarketplacePolicy = {
    id,
    listingId,
    mode: input.mode,
    requireVersion: input.requireVersion === true,
    detail: `mode=${input.mode} requireVersion=${input.requireVersion === true}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getMarketplacePolicy(
  id: string,
): MarketplacePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listMarketplacePolicies(filter?: {
  listingId?: string;
}): MarketplacePolicy[] {
  let result = [...policies.values()];
  if (filter?.listingId) {
    const listingId = filter.listingId.trim();
    result = result.filter((p) => p.listingId === listingId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearMarketplacePolicies(): void {
  policies.clear();
}
