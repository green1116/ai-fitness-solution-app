/**
 * Evolution P6 — Marketplace Ecosystem types
 */

import type {
  EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
  EXTENSION_KINDS,
  EXTENSION_STATUSES,
  INTEGRATION_CATEGORIES,
  MARKETPLACE_MANAGER_STATUSES,
  MARKETPLACE_READINESS_VERDICTS,
  MARKETPLACE_STATUSES,
  PARTNER_STATUSES,
  PARTNER_TIERS,
} from "./marketplace.constants";

export type MarketplaceStatus = (typeof MARKETPLACE_STATUSES)[number];
export type PartnerTier = (typeof PARTNER_TIERS)[number];
export type PartnerStatus = (typeof PARTNER_STATUSES)[number];
export type ExtensionKind = (typeof EXTENSION_KINDS)[number];
export type ExtensionStatus = (typeof EXTENSION_STATUSES)[number];
export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];
export type MarketplaceReadinessVerdict =
  (typeof MARKETPLACE_READINESS_VERDICTS)[number];
export type MarketplaceManagerStatus =
  (typeof MARKETPLACE_MANAGER_STATUSES)[number];

export type MarketplaceMetadata = Record<string, unknown>;

/** Marketplace model. */
export type MarketplaceProfile = {
  id: string;
  name: string;
  productId: string;
  deploymentIntelligenceId?: string;
  intelligenceDashboardId?: string;
  commercialSlaId?: string;
  status: MarketplaceStatus;
  ecosystemScore: number;
  detail: string;
  metadata: MarketplaceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateMarketplaceProfileInput = {
  id?: string;
  name: string;
  productId: string;
  deploymentIntelligenceId?: string;
  intelligenceDashboardId?: string;
  commercialSlaId?: string;
  status?: MarketplaceStatus;
  metadata?: MarketplaceMetadata;
};

/** Partner ecosystem. */
export type PartnerRecord = {
  id: string;
  marketplaceId: string;
  name: string;
  organizationId?: string;
  tier: PartnerTier;
  status: PartnerStatus;
  capabilityScore: number;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPartnerInput = {
  id?: string;
  marketplaceId: string;
  name: string;
  organizationId?: string;
  tier?: PartnerTier;
  status?: PartnerStatus;
};

/** Extension registry. */
export type ExtensionRecord = {
  id: string;
  marketplaceId: string;
  partnerId: string;
  name: string;
  kind: ExtensionKind;
  status: ExtensionStatus;
  version: string;
  detail: string;
  registeredAt: string;
  publishedAt?: string;
};

export type RegisterExtensionInput = {
  id?: string;
  marketplaceId: string;
  partnerId: string;
  name: string;
  kind: ExtensionKind;
  version?: string;
  status?: ExtensionStatus;
};

/** Integration catalog. */
export type IntegrationCatalogEntry = {
  id: string;
  marketplaceId: string;
  name: string;
  category: IntegrationCategory;
  apiCatalogEntryId?: string;
  extensionId?: string;
  readinessScore: number;
  detail: string;
  catalogedAt: string;
};

export type CatalogIntegrationInput = {
  id?: string;
  marketplaceId: string;
  name: string;
  category: IntegrationCategory;
  apiCatalogEntryId?: string;
  extensionId?: string;
};

/** Ecosystem analytics. */
export type EcosystemAnalytics = {
  id: string;
  marketplaceId: string;
  partnerCount: number;
  extensionCount: number;
  integrationCount: number;
  publishedExtensionCount: number;
  ecosystemScore: number;
  growthIndex: number;
  highlights: string[];
  detail: string;
  analyzedAt: string;
};

export type ComputeEcosystemAnalyticsInput = {
  id?: string;
  marketplaceId: string;
};

/** Readiness. */
export type MarketplaceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type MarketplaceReadinessResult = {
  marketplaceId: string;
  verdict: MarketplaceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: MarketplaceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type MarketplaceRegistryManifest = {
  marketplaceId: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_ID;
  version: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION;
  freezeVersion: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION;
  base: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE;
  marketplaceCount: number;
  partnerCount: number;
  extensionCount: number;
  integrationCount: number;
  analyticsCount: number;
};
