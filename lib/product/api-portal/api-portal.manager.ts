/**
 * Product API Portal — Manager
 */

import {
  clearPortalCatalogEntries,
  getPortalCatalogEntry,
  listPortalCatalogEntries,
  registerPortalCatalogEntry,
  updatePortalCatalogStatus,
} from "./catalog/catalog.registry";
import type {
  PortalCatalogEntry,
  RegisterPortalCatalogEntryInput,
  UpdatePortalCatalogStatusInput,
} from "./catalog/catalog.types";
import {
  clearPortalDocuments,
  getPortalDocument,
  listPortalDocuments,
  registerPortalDocument,
} from "./documentation/documentation.registry";
import type {
  PortalDocument,
  RegisterPortalDocumentInput,
} from "./documentation/documentation.types";
import {
  clearApiPortalReleaseManifests,
  createApiPortalReleaseManifest,
  getApiPortalReleaseManifest,
  listApiPortalReleaseManifests,
  type ApiPortalReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_API_PORTAL_BASE,
  PRODUCT_API_PORTAL_FREEZE_VERSION,
  PRODUCT_API_PORTAL_ID,
  PRODUCT_API_PORTAL_VERSION,
} from "./management/management.constants";
import {
  assertApiPortalReadinessReady,
  evaluateApiPortalReadiness,
} from "./management/management.readiness";
import type {
  PortalManagerStatus,
  PortalReadinessResult,
  PortalRegistryManifest,
} from "./management/management.types";
import {
  clearPortals,
  getPortal,
  listPortals,
  registerPortal,
  updatePortalStatus,
} from "./registry/portal.registry";
import type {
  ProductPortal,
  RegisterPortalInput,
  UpdatePortalStatusInput,
} from "./registry/portal.types";
import {
  clearPortalSurfaces,
  getPortalSurface,
  listPortalSurfaces,
  registerPortalSurface,
} from "./surface/surface.registry";
import type {
  PortalSurface,
  RegisterPortalSurfaceInput,
} from "./surface/surface.types";

export type PortalManagerSnapshot = {
  managerId: string;
  status: PortalManagerStatus;
  layerId: typeof PRODUCT_API_PORTAL_ID;
  version: typeof PRODUCT_API_PORTAL_VERSION;
  portalCount: number;
  docCount: number;
  catalogCount: number;
  surfaceCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ApiPortalManager = {
  initialize: () => PortalManagerSnapshot;
  start: () => PortalManagerSnapshot;
  stop: () => PortalManagerSnapshot;
  status: () => PortalManagerSnapshot;
  registerPortal: (input: RegisterPortalInput) => ProductPortal;
  updatePortalStatus: (input: UpdatePortalStatusInput) => ProductPortal;
  registerDocument: (input: RegisterPortalDocumentInput) => PortalDocument;
  registerCatalogEntry: (
    input: RegisterPortalCatalogEntryInput,
  ) => PortalCatalogEntry;
  updateCatalogStatus: (
    input: UpdatePortalCatalogStatusInput,
  ) => PortalCatalogEntry;
  registerSurface: (input: RegisterPortalSurfaceInput) => PortalSurface;
  createReleaseManifest: (input: {
    id?: string;
    portalId: string;
  }) => ApiPortalReleaseManifest;
  evaluateReadiness: () => PortalReadinessResult;
  manifest: () => PortalRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getApiPortalRegistryManifest(): PortalRegistryManifest {
  return {
    portalLayerId: PRODUCT_API_PORTAL_ID,
    version: PRODUCT_API_PORTAL_VERSION,
    freezeVersion: PRODUCT_API_PORTAL_FREEZE_VERSION,
    base: PRODUCT_API_PORTAL_BASE,
    portalCount: listPortals().length,
    docCount: listPortalDocuments().length,
    catalogCount: listPortalCatalogEntries().length,
    surfaceCount: listPortalSurfaces().length,
    releaseCount: listApiPortalReleaseManifests().length,
  };
}

export function clearApiPortalLayer(): void {
  clearApiPortalReleaseManifests();
  clearPortalSurfaces();
  clearPortalCatalogEntries();
  clearPortalDocuments();
  clearPortals();
}

export function createApiPortalManager(options?: {
  managerId?: string;
}): ApiPortalManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-apiportal-mgr");
  let state: PortalManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PortalManagerSnapshot {
    const reg = getApiPortalRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_API_PORTAL_ID,
      version: PRODUCT_API_PORTAL_VERSION,
      portalCount: reg.portalCount,
      docCount: reg.docCount,
      catalogCount: reg.catalogCount,
      surfaceCount: reg.surfaceCount,
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

  function initialize(): PortalManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearApiPortalLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PortalManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): PortalManagerSnapshot {
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
    registerPortal: (input) => {
      assertRunning("registerPortal");
      return registerPortal(input);
    },
    updatePortalStatus: (input) => {
      assertRunning("updatePortalStatus");
      return updatePortalStatus(input);
    },
    registerDocument: (input) => {
      assertRunning("registerDocument");
      return registerPortalDocument(input);
    },
    registerCatalogEntry: (input) => {
      assertRunning("registerCatalogEntry");
      return registerPortalCatalogEntry(input);
    },
    updateCatalogStatus: (input) => {
      assertRunning("updateCatalogStatus");
      return updatePortalCatalogStatus(input);
    },
    registerSurface: (input) => {
      assertRunning("registerSurface");
      return registerPortalSurface(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createApiPortalReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateApiPortalReadiness();
    },
    manifest: getApiPortalRegistryManifest,
  };
}

export {
  assertApiPortalReadinessReady,
  getApiPortalReleaseManifest,
  getPortal,
  getPortalCatalogEntry,
  getPortalDocument,
  getPortalSurface,
  listApiPortalReleaseManifests,
  listPortalCatalogEntries,
  listPortalDocuments,
  listPortalSurfaces,
  listPortals,
};
