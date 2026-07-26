/**
 * Product Marketplace — Foundation Manager
 */

import {
  clearMarketplaceDefinitions,
  defineMarketplaceDefinition,
  getMarketplaceDefinition,
  listMarketplaceDefinitions,
} from "./definition/definition.registry";
import type {
  DefineMarketplaceDefinitionInput,
  MarketplaceDefinition,
} from "./definition/definition.types";
import {
  clearMarketplaceLifecycles,
  getMarketplaceLifecycle,
  listMarketplaceLifecycles,
  openMarketplaceLifecycle,
  transitionMarketplaceLifecycle,
} from "./lifecycle/lifecycle.registry";
import type {
  MarketplaceLifecycle,
  OpenMarketplaceLifecycleInput,
  TransitionMarketplaceLifecycleInput,
} from "./lifecycle/lifecycle.types";
import {
  clearMarketplaceReleaseManifests,
  createMarketplaceReleaseManifest,
  getMarketplaceReleaseManifest,
  listMarketplaceReleaseManifests,
  type MarketplaceReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_MARKETPLACE_FOUNDATION_BASE,
  PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_FOUNDATION_ID,
  PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
} from "./management/management.constants";
import {
  assertMarketplaceFoundationReadinessReady,
  evaluateMarketplaceFoundationReadiness,
} from "./management/management.readiness";
import type {
  MarketplaceManagerStatus,
  MarketplaceReadinessResult,
  MarketplaceRegistryManifest,
} from "./management/management.types";
import {
  attachMarketplacePolicy,
  clearMarketplacePolicies,
  getMarketplacePolicy,
  listMarketplacePolicies,
} from "./policy/policy.registry";
import type {
  AttachMarketplacePolicyInput,
  MarketplacePolicy,
} from "./policy/policy.types";
import {
  clearMarketplaceListings,
  getMarketplaceListing,
  getMarketplaceListingByKey,
  listMarketplaceListings,
  registerMarketplaceListing,
} from "./registry/listing.registry";
import type {
  MarketplaceListing,
  RegisterMarketplaceListingInput,
} from "./registry/listing.types";
import {
  clearMarketplaceVersions,
  getMarketplaceVersion,
  listMarketplaceVersions,
  registerMarketplaceVersion,
} from "./version/version.registry";
import type {
  MarketplaceVersion,
  RegisterMarketplaceVersionInput,
} from "./version/version.types";

export type MarketplaceManagerSnapshot = {
  managerId: string;
  status: MarketplaceManagerStatus;
  layerId: typeof PRODUCT_MARKETPLACE_FOUNDATION_ID;
  version: typeof PRODUCT_MARKETPLACE_FOUNDATION_VERSION;
  listingCount: number;
  definitionCount: number;
  versionCount: number;
  lifecycleCount: number;
  policyCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type MarketplaceManager = {
  initialize: () => MarketplaceManagerSnapshot;
  start: () => MarketplaceManagerSnapshot;
  stop: () => MarketplaceManagerSnapshot;
  status: () => MarketplaceManagerSnapshot;
  registerListing: (
    input: RegisterMarketplaceListingInput,
  ) => MarketplaceListing;
  defineDefinition: (
    input: DefineMarketplaceDefinitionInput,
  ) => MarketplaceDefinition;
  registerVersion: (
    input: RegisterMarketplaceVersionInput,
  ) => MarketplaceVersion;
  openLifecycle: (
    input: OpenMarketplaceLifecycleInput,
  ) => MarketplaceLifecycle;
  transitionLifecycle: (
    input: TransitionMarketplaceLifecycleInput,
  ) => MarketplaceLifecycle;
  attachPolicy: (input: AttachMarketplacePolicyInput) => MarketplacePolicy;
  createReleaseManifest: (input: {
    id?: string;
    listingId: string;
  }) => MarketplaceReleaseManifest;
  evaluateReadiness: () => MarketplaceReadinessResult;
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
    foundationId: PRODUCT_MARKETPLACE_FOUNDATION_ID,
    version: PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_MARKETPLACE_FOUNDATION_BASE,
    listingCount: listMarketplaceListings().length,
    definitionCount: listMarketplaceDefinitions().length,
    versionCount: listMarketplaceVersions().length,
    lifecycleCount: listMarketplaceLifecycles().length,
    policyCount: listMarketplacePolicies().length,
    releaseCount: listMarketplaceReleaseManifests().length,
  };
}

export function clearMarketplaceFoundationLayer(): void {
  clearMarketplaceReleaseManifests();
  clearMarketplacePolicies();
  clearMarketplaceLifecycles();
  clearMarketplaceVersions();
  clearMarketplaceDefinitions();
  clearMarketplaceListings();
}

export function createMarketplaceManager(options?: {
  managerId?: string;
}): MarketplaceManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-mkt-mgr");
  let state: MarketplaceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): MarketplaceManagerSnapshot {
    const reg = getMarketplaceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_MARKETPLACE_FOUNDATION_ID,
      version: PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
      listingCount: reg.listingCount,
      definitionCount: reg.definitionCount,
      versionCount: reg.versionCount,
      lifecycleCount: reg.lifecycleCount,
      policyCount: reg.policyCount,
      releaseCount: reg.releaseCount,
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
    clearMarketplaceFoundationLayer();
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
    registerListing: (input) => {
      assertRunning("registerListing");
      return registerMarketplaceListing(input);
    },
    defineDefinition: (input) => {
      assertRunning("defineDefinition");
      return defineMarketplaceDefinition(input);
    },
    registerVersion: (input) => {
      assertRunning("registerVersion");
      return registerMarketplaceVersion(input);
    },
    openLifecycle: (input) => {
      assertRunning("openLifecycle");
      return openMarketplaceLifecycle(input);
    },
    transitionLifecycle: (input) => {
      assertRunning("transitionLifecycle");
      return transitionMarketplaceLifecycle(input);
    },
    attachPolicy: (input) => {
      assertRunning("attachPolicy");
      return attachMarketplacePolicy(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createMarketplaceReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateMarketplaceFoundationReadiness();
    },
    manifest: getMarketplaceRegistryManifest,
  };
}

export {
  assertMarketplaceFoundationReadinessReady,
  getMarketplaceDefinition,
  getMarketplaceLifecycle,
  getMarketplaceListing,
  getMarketplaceListingByKey,
  getMarketplacePolicy,
  getMarketplaceReleaseManifest,
  getMarketplaceVersion,
  listMarketplaceDefinitions,
  listMarketplaceLifecycles,
  listMarketplaceListings,
  listMarketplacePolicies,
  listMarketplaceReleaseManifests,
  listMarketplaceVersions,
};
