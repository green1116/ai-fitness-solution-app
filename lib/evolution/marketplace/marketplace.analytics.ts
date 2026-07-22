/**
 * Evolution P6 — Ecosystem Analytics
 */

import { listApiCatalogEntries } from "../../product/e12/api/api.catalog";
import { listExtensions } from "./marketplace.extension";
import { listIntegrationCatalogEntries } from "./marketplace.integration";
import { getMarketplaceProfile } from "./marketplace.model";
import { listPartners } from "./marketplace.partner";
import type {
  ComputeEcosystemAnalyticsInput,
  EcosystemAnalytics,
} from "./marketplace.types";

const analyticsStore = new Map<string, EcosystemAnalytics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAnalytics(item: EcosystemAnalytics): EcosystemAnalytics {
  return { ...item, highlights: [...item.highlights] };
}

export function computeEcosystemAnalytics(
  input: ComputeEcosystemAnalyticsInput,
): EcosystemAnalytics {
  const marketplace = getMarketplaceProfile(input.marketplaceId.trim());
  if (!marketplace) {
    throw new Error(`marketplace profile not found: ${input.marketplaceId}`);
  }

  const partners = listPartners({ marketplaceId: marketplace.id });
  const extensions = listExtensions({ marketplaceId: marketplace.id });
  const integrations = listIntegrationCatalogEntries({
    marketplaceId: marketplace.id,
  });
  const publishedExtensionCount = extensions.filter(
    (e) => e.status === "PUBLISHED",
  ).length;
  const apiCount = listApiCatalogEntries({
    productId: marketplace.productId,
  }).length;

  const growthIndex = Math.round(
    Math.max(
      10,
      Math.min(
        100,
        partners.length * 12 +
          publishedExtensionCount * 10 +
          integrations.length * 8 +
          apiCount * 4 +
          marketplace.ecosystemScore * 0.25,
      ),
    ),
  );

  const ecosystemScore = Math.round(
    Math.max(
      20,
      Math.min(
        98,
        marketplace.ecosystemScore * 0.45 +
          growthIndex * 0.35 +
          Math.min(20, partners.reduce((s, p) => s + p.capabilityScore, 0) / 20),
      ),
    ),
  );

  const highlights: string[] = [];
  if (partners.length >= 1) highlights.push(`partners=${partners.length}`);
  if (publishedExtensionCount >= 1) {
    highlights.push(`published-extensions=${publishedExtensionCount}`);
  }
  if (integrations.length >= 1) {
    highlights.push(`integrations=${integrations.length}`);
  }
  if (apiCount >= 1) highlights.push(`api-catalog=${apiCount}`);
  if (ecosystemScore >= 70) highlights.push("ecosystem-momentum-strong");
  if (highlights.length === 0) highlights.push("ecosystem-baseline");

  const id = input.id?.trim() || createId("ecoan");
  if (analyticsStore.has(id)) {
    throw new Error(`ecosystem analytics already exists: ${id}`);
  }

  const item: EcosystemAnalytics = {
    id,
    marketplaceId: marketplace.id,
    partnerCount: partners.length,
    extensionCount: extensions.length,
    integrationCount: integrations.length,
    publishedExtensionCount,
    ecosystemScore,
    growthIndex,
    highlights,
    detail: `ecosystem=${ecosystemScore} growth=${growthIndex}`,
    analyzedAt: nowIso(),
  };
  analyticsStore.set(id, item);
  return cloneAnalytics(item);
}

export function getEcosystemAnalytics(
  id: string,
): EcosystemAnalytics | undefined {
  const item = analyticsStore.get(id.trim());
  return item ? cloneAnalytics(item) : undefined;
}

export function listEcosystemAnalytics(filter?: {
  marketplaceId?: string;
}): EcosystemAnalytics[] {
  let result = [...analyticsStore.values()];
  if (filter?.marketplaceId) {
    const mid = filter.marketplaceId.trim();
    result = result.filter((a) => a.marketplaceId === mid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAnalytics);
}

export function clearEcosystemAnalytics(): void {
  analyticsStore.clear();
}
