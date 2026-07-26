/**
 * Product Marketplace — Definition registry (no connector / plugin runtime)
 */

import { getMarketplaceListing } from "../registry/listing.registry";
import type {
  DefineMarketplaceDefinitionInput,
  MarketplaceDefinition,
} from "./definition.types";

const definitions = new Map<string, MarketplaceDefinition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDefinition(
  definition: MarketplaceDefinition,
): MarketplaceDefinition {
  return { ...definition, metadata: { ...definition.metadata } };
}

export function defineMarketplaceDefinition(
  input: DefineMarketplaceDefinitionInput,
): MarketplaceDefinition {
  const listingId = input.listingId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const surfaceRef = input.surfaceRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!listingId) throw new Error("definition.listingId is required");
  if (!capabilityKey) throw new Error("definition.capabilityKey is required");
  if (!surfaceRef) throw new Error("definition.surfaceRef is required");
  if (!summary) throw new Error("definition.summary is required");
  if (!getMarketplaceListing(listingId)) {
    throw new Error(`listing not found: ${listingId}`);
  }

  const duplicate = [...definitions.values()].find(
    (d) =>
      d.listingId === listingId && d.capabilityKey === capabilityKey,
  );
  if (duplicate) {
    throw new Error(`definition already exists: ${capabilityKey}`);
  }

  const id = input.id?.trim() || createId("mktdef");
  if (definitions.has(id)) throw new Error(`definition already exists: ${id}`);

  const definition: MarketplaceDefinition = {
    id,
    listingId,
    capabilityKey,
    surfaceRef,
    summary,
    detail: `${capabilityKey}@${surfaceRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  definitions.set(id, definition);
  return cloneDefinition(definition);
}

export function getMarketplaceDefinition(
  id: string,
): MarketplaceDefinition | undefined {
  const definition = definitions.get(id.trim());
  return definition ? cloneDefinition(definition) : undefined;
}

export function listMarketplaceDefinitions(filter?: {
  listingId?: string;
}): MarketplaceDefinition[] {
  let result = [...definitions.values()];
  if (filter?.listingId) {
    const listingId = filter.listingId.trim();
    result = result.filter((d) => d.listingId === listingId);
  }
  return result
    .slice()
    .sort((a, b) => a.capabilityKey.localeCompare(b.capabilityKey))
    .map(cloneDefinition);
}

export function clearMarketplaceDefinitions(): void {
  definitions.clear();
}
