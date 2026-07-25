/**
 * Product P11 — Commercial Release Manager
 */

import {
  clearDeployments,
  completeDeployment,
  getDeployment,
  listDeployments,
  startDeployment,
} from "./deployment/deployment.registry";
import type {
  CompleteDeploymentInput,
  ReleaseDeployment,
  StartDeploymentInput,
} from "./deployment/deployment.types";
import {
  clearEnvironments,
  createEnvironment,
  getEnvironment,
  listEnvironments,
} from "./environment/environment.registry";
import type {
  CreateEnvironmentInput,
  ReleaseEnvironment,
} from "./environment/environment.types";
import {
  clearFeatures,
  getFeature,
  listFeatures,
  registerFeature,
  updateFeatureFlag,
} from "./feature/feature.registry";
import type {
  RegisterFeatureInput,
  ReleaseFeature,
  UpdateFeatureFlagInput,
} from "./feature/feature.types";
import {
  activateLicense,
  clearLicenses,
  getLicense,
  issueLicense,
  listLicenses,
} from "./license/license.registry";
import type {
  ActivateLicenseInput,
  CommercialLicense,
  IssueLicenseInput,
} from "./license/license.types";
import {
  PRODUCT_P11_COMMERCIAL_RELEASE_BASE,
  PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_ID,
  PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
} from "./release/release.constants";
import {
  assertP11CommercialReleaseReadinessReady,
  evaluateP11CommercialReleaseReadiness,
} from "./release/release.readiness";
import {
  clearReleases,
  createRelease,
  getRelease,
  listReleases,
  updateReleaseStatus,
} from "./release/release.registry";
import type {
  CommercialRelease,
  CreateReleaseInput,
  P11ManagerStatus,
  P11ReadinessResult,
  P11RegistryManifest,
  UpdateReleaseStatusInput,
} from "./release/release.types";
import {
  clearTenants,
  getTenant,
  listTenants,
  provisionTenant,
  updateTenantStatus,
} from "./tenant/tenant.registry";
import type {
  CommercialTenant,
  ProvisionTenantInput,
  UpdateTenantStatusInput,
} from "./tenant/tenant.types";
import {
  clearVersions,
  getVersion,
  listVersions,
  publishVersion,
} from "./version/version.registry";
import type {
  PublishVersionInput,
  ReleaseVersion,
} from "./version/version.types";

export type P11CommercialManagerSnapshot = {
  managerId: string;
  status: P11ManagerStatus;
  layerId: typeof PRODUCT_P11_COMMERCIAL_RELEASE_ID;
  version: typeof PRODUCT_P11_COMMERCIAL_RELEASE_VERSION;
  releaseCount: number;
  featureCount: number;
  tenantCount: number;
  deploymentCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P11CommercialManager = {
  initialize: () => P11CommercialManagerSnapshot;
  start: () => P11CommercialManagerSnapshot;
  stop: () => P11CommercialManagerSnapshot;
  status: () => P11CommercialManagerSnapshot;
  createRelease: (input: CreateReleaseInput) => CommercialRelease;
  updateReleaseStatus: (
    input: UpdateReleaseStatusInput,
  ) => CommercialRelease;
  registerFeature: (input: RegisterFeatureInput) => ReleaseFeature;
  updateFeatureFlag: (input: UpdateFeatureFlagInput) => ReleaseFeature;
  publishVersion: (input: PublishVersionInput) => ReleaseVersion;
  provisionTenant: (input: ProvisionTenantInput) => CommercialTenant;
  updateTenantStatus: (input: UpdateTenantStatusInput) => CommercialTenant;
  createEnvironment: (input: CreateEnvironmentInput) => ReleaseEnvironment;
  startDeployment: (input: StartDeploymentInput) => ReleaseDeployment;
  completeDeployment: (
    input: CompleteDeploymentInput,
  ) => ReleaseDeployment;
  issueLicense: (input: IssueLicenseInput) => CommercialLicense;
  activateLicense: (input: ActivateLicenseInput) => CommercialLicense;
  evaluateReadiness: () => P11ReadinessResult;
  manifest: () => P11RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP11RegistryManifest(): P11RegistryManifest {
  return {
    foundationId: PRODUCT_P11_COMMERCIAL_RELEASE_ID,
    version: PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
    freezeVersion: PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION,
    base: PRODUCT_P11_COMMERCIAL_RELEASE_BASE,
    releaseCount: listReleases().length,
    featureCount: listFeatures().length,
    versionCount: listVersions().length,
    tenantCount: listTenants().length,
    environmentCount: listEnvironments().length,
    deploymentCount: listDeployments().length,
    licenseCount: listLicenses().length,
  };
}

export function clearP11CommercialReleaseLayer(): void {
  clearLicenses();
  clearDeployments();
  clearEnvironments();
  clearTenants();
  clearVersions();
  clearFeatures();
  clearReleases();
}

export function createP11CommercialManager(options?: {
  managerId?: string;
}): P11CommercialManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p11-com-mgr");
  let state: P11ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P11CommercialManagerSnapshot {
    const reg = getP11RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P11_COMMERCIAL_RELEASE_ID,
      version: PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
      releaseCount: reg.releaseCount,
      featureCount: reg.featureCount,
      tenantCount: reg.tenantCount,
      deploymentCount: reg.deploymentCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P11CommercialManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP11CommercialReleaseLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P11CommercialManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P11CommercialManagerSnapshot {
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
    createRelease: (input) => {
      assertRunning("createRelease");
      return createRelease(input);
    },
    updateReleaseStatus: (input) => {
      assertRunning("updateReleaseStatus");
      return updateReleaseStatus(input);
    },
    registerFeature: (input) => {
      assertRunning("registerFeature");
      return registerFeature(input);
    },
    updateFeatureFlag: (input) => {
      assertRunning("updateFeatureFlag");
      return updateFeatureFlag(input);
    },
    publishVersion: (input) => {
      assertRunning("publishVersion");
      return publishVersion(input);
    },
    provisionTenant: (input) => {
      assertRunning("provisionTenant");
      return provisionTenant(input);
    },
    updateTenantStatus: (input) => {
      assertRunning("updateTenantStatus");
      return updateTenantStatus(input);
    },
    createEnvironment: (input) => {
      assertRunning("createEnvironment");
      return createEnvironment(input);
    },
    startDeployment: (input) => {
      assertRunning("startDeployment");
      return startDeployment(input);
    },
    completeDeployment: (input) => {
      assertRunning("completeDeployment");
      return completeDeployment(input);
    },
    issueLicense: (input) => {
      assertRunning("issueLicense");
      return issueLicense(input);
    },
    activateLicense: (input) => {
      assertRunning("activateLicense");
      return activateLicense(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP11CommercialReleaseReadiness();
    },
    manifest: getP11RegistryManifest,
  };
}

export {
  assertP11CommercialReleaseReadinessReady,
  getDeployment,
  getEnvironment,
  getFeature,
  getLicense,
  getRelease,
  getTenant,
  getVersion,
  listDeployments,
  listEnvironments,
  listFeatures,
  listLicenses,
  listReleases,
  listTenants,
  listVersions,
};
