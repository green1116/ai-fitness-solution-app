/**
 * Evolution P6 — Marketplace Ecosystem Manager
 */

import { listApiCatalogEntries } from "../../product/e12/api/api.catalog";
import { getCommercialControlRegistryManifest } from "../../product/e12/commercial/commercial.manager";
import { getDashboardRegistryManifest } from "../dashboard/dashboard.manager";
import { getGlobalRegistryManifest } from "../global/global.manager";
import {
  EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
} from "./marketplace.constants";
import {
  clearEcosystemAnalytics,
  computeEcosystemAnalytics,
  getEcosystemAnalytics,
  listEcosystemAnalytics,
} from "./marketplace.analytics";
import {
  clearExtensions,
  getExtension,
  listExtensions,
  registerExtension,
} from "./marketplace.extension";
import {
  catalogIntegration,
  clearIntegrationCatalogEntries,
  getIntegrationCatalogEntry,
  listIntegrationCatalogEntries,
} from "./marketplace.integration";
import {
  clearMarketplaceProfiles,
  createMarketplaceProfile,
  getMarketplaceProfile,
  listMarketplaceProfiles,
} from "./marketplace.model";
import {
  clearPartners,
  getPartner,
  listPartners,
  registerPartner,
} from "./marketplace.partner";
import {
  assertMarketplaceReadinessReady,
  evaluateMarketplaceReadiness,
} from "./marketplace.readiness";
import type {
  CatalogIntegrationInput,
  ComputeEcosystemAnalyticsInput,
  CreateMarketplaceProfileInput,
  EcosystemAnalytics,
  ExtensionRecord,
  IntegrationCatalogEntry,
  MarketplaceManagerStatus,
  MarketplaceProfile,
  MarketplaceReadinessResult,
  MarketplaceRegistryManifest,
  PartnerRecord,
  RegisterExtensionInput,
  RegisterPartnerInput,
} from "./marketplace.types";

export type MarketplaceManagerSnapshot = {
  managerId: string;
  status: MarketplaceManagerStatus;
  layerId: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_ID;
  version: typeof EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION;
  marketplaceCount: number;
  partnerCount: number;
  extensionCount: number;
  integrationCount: number;
  analyticsCount: number;
  apiCatalogCount: number;
  deploymentIntelligenceCount: number;
  intelligenceDashboardCount: number;
  commercialSlaCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type MarketplaceEcosystemManager = {
  initialize: () => MarketplaceManagerSnapshot;
  start: () => MarketplaceManagerSnapshot;
  stop: () => MarketplaceManagerSnapshot;
  status: () => MarketplaceManagerSnapshot;
  createMarketplace: (
    input: CreateMarketplaceProfileInput,
  ) => MarketplaceProfile;
  getMarketplace: typeof getMarketplaceProfile;
  listMarketplaces: typeof listMarketplaceProfiles;
  registerPartner: (input: RegisterPartnerInput) => PartnerRecord;
  getPartner: typeof getPartner;
  listPartners: typeof listPartners;
  registerExtension: (input: RegisterExtensionInput) => ExtensionRecord;
  getExtension: typeof getExtension;
  listExtensions: typeof listExtensions;
  catalogIntegration: (
    input: CatalogIntegrationInput,
  ) => IntegrationCatalogEntry;
  getIntegration: typeof getIntegrationCatalogEntry;
  listIntegrations: typeof listIntegrationCatalogEntries;
  computeAnalytics: (
    input: ComputeEcosystemAnalyticsInput,
  ) => EcosystemAnalytics;
  getAnalytics: typeof getEcosystemAnalytics;
  listAnalytics: typeof listEcosystemAnalytics;
  evaluateReadiness: (marketplaceId: string) => MarketplaceReadinessResult;
  manifest: () => MarketplaceRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getMarketplaceRegistryManifest(): MarketplaceRegistryManifest {
  return {
    marketplaceId: EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
    version: EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
    freezeVersion: EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION,
    base: EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE,
    marketplaceCount: listMarketplaceProfiles().length,
    partnerCount: listPartners().length,
    extensionCount: listExtensions().length,
    integrationCount: listIntegrationCatalogEntries().length,
    analyticsCount: listEcosystemAnalytics().length,
  };
}

export function clearMarketplaceEcosystemLayer(): void {
  clearEcosystemAnalytics();
  clearIntegrationCatalogEntries();
  clearExtensions();
  clearPartners();
  clearMarketplaceProfiles();
}

export function createMarketplaceEcosystemManager(options?: {
  managerId?: string;
}): MarketplaceEcosystemManager {
  const managerId =
    options?.managerId?.trim() || createId("evo-p6-mkt-mgr");
  let state: MarketplaceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): MarketplaceManagerSnapshot {
    const globalReg = getGlobalRegistryManifest();
    const dashReg = getDashboardRegistryManifest();
    const commercialReg = getCommercialControlRegistryManifest();
    const reg = getMarketplaceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
      version: EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
      marketplaceCount: reg.marketplaceCount,
      partnerCount: reg.partnerCount,
      extensionCount: reg.extensionCount,
      integrationCount: reg.integrationCount,
      analyticsCount: reg.analyticsCount,
      apiCatalogCount: listApiCatalogEntries().length,
      deploymentIntelligenceCount: globalReg.deploymentIntelligenceCount,
      intelligenceDashboardCount: dashReg.intelligenceDashboardCount,
      commercialSlaCount: commercialReg.slaCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): MarketplaceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearMarketplaceEcosystemLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): MarketplaceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): MarketplaceManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    createMarketplace: (input) => {
      assertRunning("createMarketplace");
      return createMarketplaceProfile(input);
    },
    getMarketplace: getMarketplaceProfile,
    listMarketplaces: listMarketplaceProfiles,
    registerPartner: (input) => {
      assertRunning("registerPartner");
      return registerPartner(input);
    },
    getPartner,
    listPartners,
    registerExtension: (input) => {
      assertRunning("registerExtension");
      return registerExtension(input);
    },
    getExtension,
    listExtensions,
    catalogIntegration: (input) => {
      assertRunning("catalogIntegration");
      return catalogIntegration(input);
    },
    getIntegration: getIntegrationCatalogEntry,
    listIntegrations: listIntegrationCatalogEntries,
    computeAnalytics: (input) => {
      assertRunning("computeAnalytics");
      return computeEcosystemAnalytics(input);
    },
    getAnalytics: getEcosystemAnalytics,
    listAnalytics: listEcosystemAnalytics,
    evaluateReadiness: (marketplaceId) => {
      assertRunning("evaluateReadiness");
      return evaluateMarketplaceReadiness(marketplaceId);
    },
    manifest: getMarketplaceRegistryManifest,
  };
}

export { assertMarketplaceReadinessReady };
