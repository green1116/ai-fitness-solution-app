/**
 * Product Marketplace — Version registry
 */

import { getMarketplaceDefinition } from "../definition/definition.registry";
import { getMarketplaceListing } from "../registry/listing.registry";
import type {
  MarketplaceVersion,
  RegisterMarketplaceVersionInput,
} from "./version.types";

const versions = new Map<string, MarketplaceVersion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVersion(version: MarketplaceVersion): MarketplaceVersion {
  return {
    ...version,
    definitionIds: [...version.definitionIds],
    metadata: { ...version.metadata },
  };
}

export function registerMarketplaceVersion(
  input: RegisterMarketplaceVersionInput,
): MarketplaceVersion {
  const listingId = input.listingId.trim();
  const versionTag = input.versionTag.trim();
  if (!listingId) throw new Error("version.listingId is required");
  if (!versionTag) throw new Error("version.versionTag is required");
  if (!input.definitionIds.length) {
    throw new Error("version.definitionIds is required");
  }
  if (!getMarketplaceListing(listingId)) {
    throw new Error(`listing not found: ${listingId}`);
  }

  const definitionIds = input.definitionIds
    .map((id) => id.trim())
    .filter(Boolean);
  for (const definitionId of definitionIds) {
    const definition = getMarketplaceDefinition(definitionId);
    if (!definition) throw new Error(`definition not found: ${definitionId}`);
    if (definition.listingId !== listingId) {
      throw new Error(`definition listing mismatch: ${definitionId}`);
    }
  }

  const duplicate = [...versions.values()].find(
    (v) => v.listingId === listingId && v.versionTag === versionTag,
  );
  if (duplicate) {
    throw new Error(`version already exists: ${versionTag}`);
  }

  const id = input.id?.trim() || createId("mktver");
  if (versions.has(id)) throw new Error(`version already exists: ${id}`);

  const version: MarketplaceVersion = {
    id,
    listingId,
    versionTag,
    definitionIds: [...definitionIds].sort((a, b) => a.localeCompare(b)),
    detail: `version=${versionTag} defs=${definitionIds.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  versions.set(id, version);
  return cloneVersion(version);
}

export function getMarketplaceVersion(
  id: string,
): MarketplaceVersion | undefined {
  const version = versions.get(id.trim());
  return version ? cloneVersion(version) : undefined;
}

export function listMarketplaceVersions(filter?: {
  listingId?: string;
}): MarketplaceVersion[] {
  let result = [...versions.values()];
  if (filter?.listingId) {
    const listingId = filter.listingId.trim();
    result = result.filter((v) => v.listingId === listingId);
  }
  return result
    .slice()
    .sort((a, b) => a.versionTag.localeCompare(b.versionTag))
    .map(cloneVersion);
}

export function clearMarketplaceVersions(): void {
  versions.clear();
}
