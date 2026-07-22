/**
 * Evolution P6 — Integration Catalog
 * Integrates API product catalog + marketplace extensions
 */

import { getApiCatalogEntry } from "../../product/e12/api/api.catalog";
import { INTEGRATION_CATEGORIES } from "./marketplace.constants";
import { getExtension } from "./marketplace.extension";
import { getMarketplaceProfile } from "./marketplace.model";
import type {
  CatalogIntegrationInput,
  IntegrationCatalogEntry,
  IntegrationCategory,
} from "./marketplace.types";

const integrations = new Map<string, IntegrationCatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIntegration(
  entry: IntegrationCatalogEntry,
): IntegrationCatalogEntry {
  return { ...entry };
}

export function catalogIntegration(
  input: CatalogIntegrationInput,
): IntegrationCatalogEntry {
  const marketplace = getMarketplaceProfile(input.marketplaceId.trim());
  if (!marketplace) {
    throw new Error(`marketplace profile not found: ${input.marketplaceId}`);
  }

  const name = input.name.trim();
  if (!name) throw new Error("integration.name is required");

  const category = input.category;
  if (!(INTEGRATION_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error(`invalid integration category: ${category}`);
  }

  let readinessScore = 50;
  if (input.apiCatalogEntryId) {
    const api = getApiCatalogEntry(input.apiCatalogEntryId.trim());
    if (!api || api.productId !== marketplace.productId) {
      throw new Error(
        `api catalog entry not found: ${input.apiCatalogEntryId}`,
      );
    }
    readinessScore += api.status === "ACTIVE" ? 25 : 10;
  }

  if (input.extensionId) {
    const extension = getExtension(input.extensionId.trim());
    if (!extension || extension.marketplaceId !== marketplace.id) {
      throw new Error(`extension not found: ${input.extensionId}`);
    }
    readinessScore += extension.status === "PUBLISHED" ? 20 : 8;
  }

  readinessScore = Math.min(98, readinessScore);

  const id = input.id?.trim() || createId("integ");
  if (integrations.has(id)) {
    throw new Error(`integration catalog entry already exists: ${id}`);
  }

  const entry: IntegrationCatalogEntry = {
    id,
    marketplaceId: marketplace.id,
    name,
    category,
    apiCatalogEntryId: input.apiCatalogEntryId?.trim() || undefined,
    extensionId: input.extensionId?.trim() || undefined,
    readinessScore,
    detail: `category=${category} readiness=${readinessScore}`,
    catalogedAt: nowIso(),
  };
  integrations.set(id, entry);
  return cloneIntegration(entry);
}

export function getIntegrationCatalogEntry(
  id: string,
): IntegrationCatalogEntry | undefined {
  const entry = integrations.get(id.trim());
  return entry ? cloneIntegration(entry) : undefined;
}

export function listIntegrationCatalogEntries(filter?: {
  marketplaceId?: string;
  category?: IntegrationCategory;
}): IntegrationCatalogEntry[] {
  let result = [...integrations.values()];
  if (filter?.marketplaceId) {
    const mid = filter.marketplaceId.trim();
    result = result.filter((i) => i.marketplaceId === mid);
  }
  if (filter?.category) {
    result = result.filter((i) => i.category === filter.category);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIntegration);
}

export function clearIntegrationCatalogEntries(): void {
  integrations.clear();
}
