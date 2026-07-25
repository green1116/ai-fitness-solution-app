/**
 * Product Configuration — System Configuration Manager
 */

import {
  PRODUCT_SYSTEM_CONFIGURATION_BASE,
  PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_ID,
  PRODUCT_SYSTEM_CONFIGURATION_VERSION,
} from "./management/management.constants";
import {
  assertSystemConfigurationReadinessReady,
  evaluateSystemConfigurationReadiness,
} from "./management/management.readiness";
import type {
  ConfigurationManagerStatus,
  ConfigurationReadinessResult,
  ConfigurationRegistryManifest,
} from "./management/management.types";
import {
  clearConfigNamespaces,
  getConfigNamespace,
  listConfigNamespaces,
  registerConfigNamespace,
  updateConfigNamespaceStatus,
} from "./namespace/namespace.registry";
import type {
  ConfigNamespace,
  RegisterConfigNamespaceInput,
  UpdateConfigNamespaceStatusInput,
} from "./namespace/namespace.types";
import {
  applyConfigOverride,
  clearConfigOverrides,
  getConfigOverride,
  listConfigOverrides,
} from "./override/override.registry";
import type {
  ApplyConfigOverrideInput,
  ConfigOverride,
} from "./override/override.types";
import {
  clearConfigParameters,
  getConfigParameter,
  listConfigParameters,
  setConfigParameter,
} from "./parameter/parameter.registry";
import type {
  ConfigParameter,
  SetConfigParameterInput,
} from "./parameter/parameter.types";
import {
  clearConfigReleases,
  createConfigRelease,
  getConfigRelease,
  listConfigReleases,
  updateConfigReleaseStatus,
} from "./release/release.registry";
import type {
  ConfigRelease,
  CreateConfigReleaseInput,
  UpdateConfigReleaseStatusInput,
} from "./release/release.types";

export type ConfigurationManagerSnapshot = {
  managerId: string;
  status: ConfigurationManagerStatus;
  layerId: typeof PRODUCT_SYSTEM_CONFIGURATION_ID;
  version: typeof PRODUCT_SYSTEM_CONFIGURATION_VERSION;
  namespaceCount: number;
  parameterCount: number;
  overrideCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ConfigurationManager = {
  initialize: () => ConfigurationManagerSnapshot;
  start: () => ConfigurationManagerSnapshot;
  stop: () => ConfigurationManagerSnapshot;
  status: () => ConfigurationManagerSnapshot;
  registerNamespace: (
    input: RegisterConfigNamespaceInput,
  ) => ConfigNamespace;
  updateNamespaceStatus: (
    input: UpdateConfigNamespaceStatusInput,
  ) => ConfigNamespace;
  setParameter: (input: SetConfigParameterInput) => ConfigParameter;
  applyOverride: (input: ApplyConfigOverrideInput) => ConfigOverride;
  createRelease: (input: CreateConfigReleaseInput) => ConfigRelease;
  updateReleaseStatus: (
    input: UpdateConfigReleaseStatusInput,
  ) => ConfigRelease;
  evaluateReadiness: () => ConfigurationReadinessResult;
  manifest: () => ConfigurationRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getConfigurationRegistryManifest(): ConfigurationRegistryManifest {
  return {
    configurationId: PRODUCT_SYSTEM_CONFIGURATION_ID,
    version: PRODUCT_SYSTEM_CONFIGURATION_VERSION,
    freezeVersion: PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION,
    base: PRODUCT_SYSTEM_CONFIGURATION_BASE,
    namespaceCount: listConfigNamespaces().length,
    parameterCount: listConfigParameters().length,
    overrideCount: listConfigOverrides().length,
    releaseCount: listConfigReleases().length,
  };
}

export function clearSystemConfigurationLayer(): void {
  clearConfigReleases();
  clearConfigOverrides();
  clearConfigParameters();
  clearConfigNamespaces();
}

export function createConfigurationManager(options?: {
  managerId?: string;
}): ConfigurationManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-cfg-mgr");
  let state: ConfigurationManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ConfigurationManagerSnapshot {
    const reg = getConfigurationRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_SYSTEM_CONFIGURATION_ID,
      version: PRODUCT_SYSTEM_CONFIGURATION_VERSION,
      namespaceCount: reg.namespaceCount,
      parameterCount: reg.parameterCount,
      overrideCount: reg.overrideCount,
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

  function initialize(): ConfigurationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearSystemConfigurationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ConfigurationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ConfigurationManagerSnapshot {
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
    registerNamespace: (input) => {
      assertRunning("registerNamespace");
      return registerConfigNamespace(input);
    },
    updateNamespaceStatus: (input) => {
      assertRunning("updateNamespaceStatus");
      return updateConfigNamespaceStatus(input);
    },
    setParameter: (input) => {
      assertRunning("setParameter");
      return setConfigParameter(input);
    },
    applyOverride: (input) => {
      assertRunning("applyOverride");
      return applyConfigOverride(input);
    },
    createRelease: (input) => {
      assertRunning("createRelease");
      return createConfigRelease(input);
    },
    updateReleaseStatus: (input) => {
      assertRunning("updateReleaseStatus");
      return updateConfigReleaseStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateSystemConfigurationReadiness();
    },
    manifest: getConfigurationRegistryManifest,
  };
}

export {
  assertSystemConfigurationReadinessReady,
  getConfigNamespace,
  getConfigOverride,
  getConfigParameter,
  getConfigRelease,
  listConfigNamespaces,
  listConfigOverrides,
  listConfigParameters,
  listConfigReleases,
};
