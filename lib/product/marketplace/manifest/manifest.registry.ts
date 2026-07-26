/**
 * Product Marketplace — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listMarketplaceDefinitions } from "../definition/definition.registry";
import { listMarketplaceLifecycles } from "../lifecycle/lifecycle.registry";
import { listMarketplacePolicies } from "../policy/policy.registry";
import { getMarketplaceListing } from "../registry/listing.registry";
import { listMarketplaceVersions } from "../version/version.registry";

export type MarketplaceReleaseManifest = {
  id: string;
  listingId: string;
  listingKey: string;
  checksum: string;
  definitionId: string;
  versionId: string;
  lifecycleId: string;
  policyId: string;
  createdAt: string;
};

const releases = new Map<string, MarketplaceReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: MarketplaceReleaseManifest,
): MarketplaceReleaseManifest {
  return { ...release };
}

export function createMarketplaceReleaseManifest(input: {
  id?: string;
  listingId: string;
}): MarketplaceReleaseManifest {
  const listingId = input.listingId.trim();
  if (!listingId) throw new Error("manifest.listingId is required");

  const listing = getMarketplaceListing(listingId);
  if (!listing) throw new Error(`listing not found: ${listingId}`);

  const definitions = listMarketplaceDefinitions({ listingId });
  if (definitions.length < 1) throw new Error("definition missing");
  const versions = listMarketplaceVersions({ listingId });
  if (versions.length < 1) throw new Error("version missing");
  const lifecycles = listMarketplaceLifecycles({ listingId });
  const published = lifecycles.find((l) => l.state === "PUBLISHED");
  if (!published) throw new Error("published lifecycle missing");
  const policies = listMarketplacePolicies({ listingId });
  if (policies.length < 1) throw new Error("policy missing");

  const payload = {
    listingKey: listing.listingKey,
    kind: listing.kind,
    definitions: definitions
      .map((d) => ({
        capabilityKey: d.capabilityKey,
        surfaceRef: d.surfaceRef,
        summary: d.summary,
      }))
      .sort((a, b) => a.capabilityKey.localeCompare(b.capabilityKey)),
    versions: versions
      .map((v) => ({
        versionTag: v.versionTag,
        definitionIds: [...v.definitionIds],
      }))
      .sort((a, b) => a.versionTag.localeCompare(b.versionTag)),
    lifecycle: { state: published.state, versionId: published.versionId },
    policy: {
      mode: policies[0].mode,
      requireVersion: policies[0].requireVersion,
    },
  };

  const id = input.id?.trim() || createId("mktrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: MarketplaceReleaseManifest = {
    id,
    listingId,
    listingKey: listing.listingKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    definitionId: definitions[0].id,
    versionId: versions[0].id,
    lifecycleId: published.id,
    policyId: policies[0].id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getMarketplaceReleaseManifest(
  id: string,
): MarketplaceReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listMarketplaceReleaseManifests(): MarketplaceReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearMarketplaceReleaseManifests(): void {
  releases.clear();
}
