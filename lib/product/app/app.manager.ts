/**
 * Product App — Registry Manager
 */

import {
  clearAppDefinitions,
  getAppDefinition,
  listAppDefinitions,
  registerAppDefinition,
} from "./definition/definition.registry";
import type {
  AppDefinition,
  RegisterAppDefinitionInput,
} from "./definition/definition.types";
import {
  clearAppReleaseManifests,
  createAppReleaseManifest,
  getAppReleaseManifest,
  listAppReleaseManifests,
  type AppReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_APP_REGISTRY_BASE,
  PRODUCT_APP_REGISTRY_FREEZE_VERSION,
  PRODUCT_APP_REGISTRY_ID,
  PRODUCT_APP_REGISTRY_VERSION,
} from "./management/management.constants";
import {
  assertAppRegistryReadinessReady,
  evaluateAppRegistryReadiness,
} from "./management/management.readiness";
import type {
  AppManagerStatus,
  AppReadinessResult,
  AppRegistryManifest,
} from "./management/management.types";
import {
  assignAppOwnership,
  clearAppOwnerships,
  getAppOwnership,
  listAppOwnerships,
  updateAppOwnershipStatus,
} from "./ownership/ownership.registry";
import type {
  AppOwnership,
  AssignAppOwnershipInput,
  UpdateAppOwnershipStatusInput,
} from "./ownership/ownership.types";
import {
  clearApps,
  getApp,
  listApps,
  registerApp,
  updateAppStatus,
} from "./registry/app.registry";
import type {
  ProductApp,
  RegisterAppInput,
  UpdateAppStatusInput,
} from "./registry/app.types";
import {
  clearAppVersions,
  getAppVersion,
  listAppVersions,
  registerAppVersion,
  updateAppVersionStatus,
} from "./version/version.registry";
import type {
  AppVersion,
  RegisterAppVersionInput,
  UpdateAppVersionStatusInput,
} from "./version/version.types";

export type AppManagerSnapshot = {
  managerId: string;
  status: AppManagerStatus;
  layerId: typeof PRODUCT_APP_REGISTRY_ID;
  version: typeof PRODUCT_APP_REGISTRY_VERSION;
  appCount: number;
  definitionCount: number;
  versionCount: number;
  ownershipCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AppManager = {
  initialize: () => AppManagerSnapshot;
  start: () => AppManagerSnapshot;
  stop: () => AppManagerSnapshot;
  status: () => AppManagerSnapshot;
  registerApp: (input: RegisterAppInput) => ProductApp;
  updateAppStatus: (input: UpdateAppStatusInput) => ProductApp;
  registerDefinition: (input: RegisterAppDefinitionInput) => AppDefinition;
  registerVersion: (input: RegisterAppVersionInput) => AppVersion;
  updateVersionStatus: (input: UpdateAppVersionStatusInput) => AppVersion;
  assignOwnership: (input: AssignAppOwnershipInput) => AppOwnership;
  updateOwnershipStatus: (
    input: UpdateAppOwnershipStatusInput,
  ) => AppOwnership;
  createReleaseManifest: (input: {
    id?: string;
    appId: string;
  }) => AppReleaseManifest;
  evaluateReadiness: () => AppReadinessResult;
  manifest: () => AppRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAppRegistryManifest(): AppRegistryManifest {
  return {
    managementId: PRODUCT_APP_REGISTRY_ID,
    version: PRODUCT_APP_REGISTRY_VERSION,
    freezeVersion: PRODUCT_APP_REGISTRY_FREEZE_VERSION,
    base: PRODUCT_APP_REGISTRY_BASE,
    appCount: listApps().length,
    definitionCount: listAppDefinitions().length,
    versionCount: listAppVersions().length,
    ownershipCount: listAppOwnerships().length,
    releaseCount: listAppReleaseManifests().length,
  };
}

export function clearAppRegistryLayer(): void {
  clearAppReleaseManifests();
  clearAppOwnerships();
  clearAppVersions();
  clearAppDefinitions();
  clearApps();
}

export function createAppManager(options?: {
  managerId?: string;
}): AppManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-app-mgr");
  let state: AppManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AppManagerSnapshot {
    const reg = getAppRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_APP_REGISTRY_ID,
      version: PRODUCT_APP_REGISTRY_VERSION,
      appCount: reg.appCount,
      definitionCount: reg.definitionCount,
      versionCount: reg.versionCount,
      ownershipCount: reg.ownershipCount,
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

  function initialize(): AppManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAppRegistryLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AppManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AppManagerSnapshot {
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
    registerApp: (input) => {
      assertRunning("registerApp");
      return registerApp(input);
    },
    updateAppStatus: (input) => {
      assertRunning("updateAppStatus");
      return updateAppStatus(input);
    },
    registerDefinition: (input) => {
      assertRunning("registerDefinition");
      return registerAppDefinition(input);
    },
    registerVersion: (input) => {
      assertRunning("registerVersion");
      return registerAppVersion(input);
    },
    updateVersionStatus: (input) => {
      assertRunning("updateVersionStatus");
      return updateAppVersionStatus(input);
    },
    assignOwnership: (input) => {
      assertRunning("assignOwnership");
      return assignAppOwnership(input);
    },
    updateOwnershipStatus: (input) => {
      assertRunning("updateOwnershipStatus");
      return updateAppOwnershipStatus(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createAppReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateAppRegistryReadiness();
    },
    manifest: getAppRegistryManifest,
  };
}

export {
  assertAppRegistryReadinessReady,
  getApp,
  getAppDefinition,
  getAppOwnership,
  getAppReleaseManifest,
  getAppVersion,
  listAppDefinitions,
  listAppOwnerships,
  listAppReleaseManifests,
  listApps,
  listAppVersions,
};
