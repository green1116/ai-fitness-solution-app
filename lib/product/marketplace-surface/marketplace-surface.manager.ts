/**
 * Product Marketplace Surface — Manager
 */

import {
  clearSurfaceCatalogs,
  getSurfaceCatalog,
  listSurfaceCatalogs,
  registerSurfaceCatalog,
  updateSurfaceCatalogStatus,
} from "./catalog/catalog.registry";
import type {
  MarketplaceSurfaceCatalog,
  RegisterSurfaceCatalogInput,
  UpdateSurfaceCatalogStatusInput,
} from "./catalog/catalog.types";
import {
  clearSurfaceListings,
  getSurfaceListing,
  listSurfaceListings,
  registerSurfaceListing,
  updateSurfaceListingStatus,
} from "./listing/listing.registry";
import type {
  MarketplaceSurfaceListing,
  RegisterSurfaceListingInput,
  UpdateSurfaceListingStatusInput,
} from "./listing/listing.types";
import {
  clearMarketplaceSurfaceReleaseManifests,
  createMarketplaceSurfaceReleaseManifest,
  getMarketplaceSurfaceReleaseManifest,
  listMarketplaceSurfaceReleaseManifests,
  type MarketplaceSurfaceReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_MARKETPLACE_SURFACE_BASE,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_SURFACE_ID,
  PRODUCT_MARKETPLACE_SURFACE_VERSION,
} from "./management/management.constants";
import {
  assertMarketplaceSurfaceReadinessReady,
  evaluateMarketplaceSurfaceReadiness,
} from "./management/management.readiness";
import type {
  MarketplaceSurfaceRegistryManifest,
  SurfaceManagerStatus,
  SurfaceReadinessResult,
} from "./management/management.types";
import {
  clearSurfacePlacements,
  getSurfacePlacement,
  listSurfacePlacements,
  registerSurfacePlacement,
} from "./placement/placement.registry";
import type {
  MarketplaceSurfacePlacement,
  RegisterSurfacePlacementInput,
} from "./placement/placement.types";
import {
  attachSurfaceVisibility,
  clearSurfaceVisibilities,
  getSurfaceVisibility,
  listSurfaceVisibilities,
} from "./visibility/visibility.registry";
import type {
  AttachSurfaceVisibilityInput,
  MarketplaceSurfaceVisibility,
} from "./visibility/visibility.types";

export type MarketplaceSurfaceManagerSnapshot = {
  managerId: string;
  status: SurfaceManagerStatus;
  layerId: typeof PRODUCT_MARKETPLACE_SURFACE_ID;
  version: typeof PRODUCT_MARKETPLACE_SURFACE_VERSION;
  catalogCount: number;
  listingCount: number;
  visibilityCount: number;
  placementCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type MarketplaceSurfaceManager = {
  initialize: () => MarketplaceSurfaceManagerSnapshot;
  start: () => MarketplaceSurfaceManagerSnapshot;
  stop: () => MarketplaceSurfaceManagerSnapshot;
  status: () => MarketplaceSurfaceManagerSnapshot;
  registerCatalog: (
    input: RegisterSurfaceCatalogInput,
  ) => MarketplaceSurfaceCatalog;
  updateCatalogStatus: (
    input: UpdateSurfaceCatalogStatusInput,
  ) => MarketplaceSurfaceCatalog;
  registerListing: (
    input: RegisterSurfaceListingInput,
  ) => MarketplaceSurfaceListing;
  updateListingStatus: (
    input: UpdateSurfaceListingStatusInput,
  ) => MarketplaceSurfaceListing;
  attachVisibility: (
    input: AttachSurfaceVisibilityInput,
  ) => MarketplaceSurfaceVisibility;
  registerPlacement: (
    input: RegisterSurfacePlacementInput,
  ) => MarketplaceSurfacePlacement;
  createReleaseManifest: (input: {
    id?: string;
    catalogId: string;
  }) => MarketplaceSurfaceReleaseManifest;
  evaluateReadiness: () => SurfaceReadinessResult;
  manifest: () => MarketplaceSurfaceRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getMarketplaceSurfaceRegistryManifest(): MarketplaceSurfaceRegistryManifest {
  return {
    managementId: PRODUCT_MARKETPLACE_SURFACE_ID,
    version: PRODUCT_MARKETPLACE_SURFACE_VERSION,
    freezeVersion: PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION,
    base: PRODUCT_MARKETPLACE_SURFACE_BASE,
    catalogCount: listSurfaceCatalogs().length,
    listingCount: listSurfaceListings().length,
    visibilityCount: listSurfaceVisibilities().length,
    placementCount: listSurfacePlacements().length,
    releaseCount: listMarketplaceSurfaceReleaseManifests().length,
  };
}

export function clearMarketplaceSurfaceLayer(): void {
  clearMarketplaceSurfaceReleaseManifests();
  clearSurfacePlacements();
  clearSurfaceVisibilities();
  clearSurfaceListings();
  clearSurfaceCatalogs();
}

export function createMarketplaceSurfaceManager(options?: {
  managerId?: string;
}): MarketplaceSurfaceManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-surf-mgr");
  let state: SurfaceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): MarketplaceSurfaceManagerSnapshot {
    const reg = getMarketplaceSurfaceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_MARKETPLACE_SURFACE_ID,
      version: PRODUCT_MARKETPLACE_SURFACE_VERSION,
      catalogCount: reg.catalogCount,
      listingCount: reg.listingCount,
      visibilityCount: reg.visibilityCount,
      placementCount: reg.placementCount,
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

  function initialize(): MarketplaceSurfaceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearMarketplaceSurfaceLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): MarketplaceSurfaceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): MarketplaceSurfaceManagerSnapshot {
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
    registerCatalog: (input) => {
      assertRunning("registerCatalog");
      return registerSurfaceCatalog(input);
    },
    updateCatalogStatus: (input) => {
      assertRunning("updateCatalogStatus");
      return updateSurfaceCatalogStatus(input);
    },
    registerListing: (input) => {
      assertRunning("registerListing");
      return registerSurfaceListing(input);
    },
    updateListingStatus: (input) => {
      assertRunning("updateListingStatus");
      return updateSurfaceListingStatus(input);
    },
    attachVisibility: (input) => {
      assertRunning("attachVisibility");
      return attachSurfaceVisibility(input);
    },
    registerPlacement: (input) => {
      assertRunning("registerPlacement");
      return registerSurfacePlacement(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createMarketplaceSurfaceReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateMarketplaceSurfaceReadiness();
    },
    manifest: getMarketplaceSurfaceRegistryManifest,
  };
}

export {
  assertMarketplaceSurfaceReadinessReady,
  getSurfaceCatalog,
  getSurfaceListing,
  getSurfacePlacement,
  getSurfaceVisibility,
  getMarketplaceSurfaceReleaseManifest,
  listSurfaceCatalogs,
  listSurfaceListings,
  listSurfacePlacements,
  listSurfaceVisibilities,
  listMarketplaceSurfaceReleaseManifests,
};
