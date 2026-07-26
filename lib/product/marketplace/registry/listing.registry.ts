/**
 * Product Marketplace — Listing registry
 */

import { MARKETPLACE_LISTING_KINDS } from "../management/management.constants";
import type {
  MarketplaceListing,
  MarketplaceListingKind,
  RegisterMarketplaceListingInput,
} from "./listing.types";

const listings = new Map<string, MarketplaceListing>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneListing(listing: MarketplaceListing): MarketplaceListing {
  return { ...listing, metadata: { ...listing.metadata } };
}

export function registerMarketplaceListing(
  input: RegisterMarketplaceListingInput,
): MarketplaceListing {
  const listingKey = input.listingKey.trim().toUpperCase();
  const name = input.name.trim();
  if (!listingKey) throw new Error("listing.listingKey is required");
  if (!name) throw new Error("listing.name is required");
  if (!(MARKETPLACE_LISTING_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid listing kind: ${input.kind}`);
  }
  if (keys.has(listingKey)) {
    throw new Error(`listingKey already exists: ${listingKey}`);
  }

  const id = input.id?.trim() || createId("mktlist");
  if (listings.has(id)) throw new Error(`listing already exists: ${id}`);

  const listing: MarketplaceListing = {
    id,
    listingKey,
    name,
    kind: input.kind,
    detail: `key=${listingKey} kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  listings.set(id, listing);
  keys.set(listingKey, id);
  return cloneListing(listing);
}

export function getMarketplaceListing(
  id: string,
): MarketplaceListing | undefined {
  const listing = listings.get(id.trim());
  return listing ? cloneListing(listing) : undefined;
}

export function getMarketplaceListingByKey(
  listingKey: string,
): MarketplaceListing | undefined {
  const id = keys.get(listingKey.trim().toUpperCase());
  return id ? getMarketplaceListing(id) : undefined;
}

export function listMarketplaceListings(filter?: {
  kind?: MarketplaceListingKind;
}): MarketplaceListing[] {
  let result = [...listings.values()];
  if (filter?.kind) result = result.filter((l) => l.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.listingKey.localeCompare(b.listingKey))
    .map(cloneListing);
}

export function clearMarketplaceListings(): void {
  listings.clear();
  keys.clear();
}
