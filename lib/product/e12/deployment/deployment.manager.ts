/**
 * E12-P6 — Deployment Package Manager
 */

import { getApiProductRegistryManifest } from "../api/api.manager";
import { getProductRegistryManifest } from "../registry/product.registry";
import { getTenantProductRegistryManifest } from "../tenant/tenant.manager";
import {
  setEnterpriseDeploymentConfig,
  getEnterpriseDeploymentConfig,
  listEnterpriseDeploymentConfigs,
  clearEnterpriseDeploymentConfigs,
} from "./deployment.config";
import {
  buildReleaseArtifact,
  distributeReleaseArtifact,
  getReleaseArtifact,
  listReleaseArtifacts,
  signReleaseArtifact,
  clearReleaseArtifacts,
} from "./deployment.artifact";
import {
  E12_DEPLOYMENT_PACKAGE_BASE,
  E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
  E12_DEPLOYMENT_PACKAGE_ID,
  E12_DEPLOYMENT_PACKAGE_VERSION,
} from "./deployment.constants";
import {
  createEnvironmentProfile,
  getEnvironmentProfile,
  listEnvironmentProfiles,
  clearEnvironmentProfiles,
} from "./deployment.environment";
import {
  buildInstallationManifest,
  assertInstallationManifestReady,
} from "./deployment.manifest";
import {
  createDeploymentPackage,
  getDeploymentPackage,
  listDeploymentPackages,
  clearDeploymentPackages,
} from "./deployment.package";
import {
  assertDeploymentValidationPass,
  validateDeploymentPackage,
} from "./deployment.validator";
import type {
  BuildReleaseArtifactInput,
  CreateDeploymentPackageInput,
  CreateEnvironmentProfileInput,
  DeploymentManagerStatus,
  DeploymentPackage,
  DeploymentRegistryManifest,
  DeploymentValidationResult,
  EnterpriseDeploymentConfig,
  EnvironmentProfile,
  InstallationManifest,
  ReleaseArtifact,
  SetEnterpriseDeploymentConfigInput,
} from "./deployment.types";

export type DeploymentManagerSnapshot = {
  managerId: string;
  status: DeploymentManagerStatus;
  layerId: typeof E12_DEPLOYMENT_PACKAGE_ID;
  version: typeof E12_DEPLOYMENT_PACKAGE_VERSION;
  packageCount: number;
  environmentCount: number;
  configCount: number;
  artifactCount: number;
  tenantProductCount: number;
  apiCatalogCount: number;
  productIdentityCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type DeploymentPackageManager = {
  initialize: () => DeploymentManagerSnapshot;
  start: () => DeploymentManagerSnapshot;
  stop: () => DeploymentManagerSnapshot;
  status: () => DeploymentManagerSnapshot;
  createPackage: (input: CreateDeploymentPackageInput) => DeploymentPackage;
  getPackage: typeof getDeploymentPackage;
  listPackages: typeof listDeploymentPackages;
  createEnvironment: (input: CreateEnvironmentProfileInput) => EnvironmentProfile;
  getEnvironment: typeof getEnvironmentProfile;
  listEnvironments: typeof listEnvironmentProfiles;
  setConfig: (input: SetEnterpriseDeploymentConfigInput) => EnterpriseDeploymentConfig;
  getConfig: typeof getEnterpriseDeploymentConfig;
  listConfigs: typeof listEnterpriseDeploymentConfigs;
  validate: (
    deploymentPackageId: string,
    options?: { environmentProfileId?: string },
  ) => DeploymentValidationResult;
  buildArtifact: (input: BuildReleaseArtifactInput) => ReleaseArtifact;
  signArtifact: typeof signReleaseArtifact;
  distributeArtifact: typeof distributeReleaseArtifact;
  getArtifact: typeof getReleaseArtifact;
  listArtifacts: typeof listReleaseArtifacts;
  installationManifest: (input: {
    deploymentPackageId: string;
    environmentProfileId: string;
    artifactId?: string;
  }) => InstallationManifest;
  manifest: () => DeploymentRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getDeploymentRegistryManifest(): DeploymentRegistryManifest {
  return {
    deploymentPackageId: E12_DEPLOYMENT_PACKAGE_ID,
    version: E12_DEPLOYMENT_PACKAGE_VERSION,
    freezeVersion: E12_DEPLOYMENT_PACKAGE_FREEZE_VERSION,
    base: E12_DEPLOYMENT_PACKAGE_BASE,
    packageCount: listDeploymentPackages().length,
    environmentCount: listEnvironmentProfiles().length,
    configCount: listEnterpriseDeploymentConfigs().length,
    artifactCount: listReleaseArtifacts().length,
  };
}

export function clearDeploymentLayer(): void {
  clearReleaseArtifacts();
  clearEnterpriseDeploymentConfigs();
  clearEnvironmentProfiles();
  clearDeploymentPackages();
}

export function createDeploymentPackageManager(options?: {
  managerId?: string;
}): DeploymentPackageManager {
  const managerId =
    options?.managerId?.trim() || createId("e12-dpm-mgr");
  let state: DeploymentManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): DeploymentManagerSnapshot {
    const productReg = getProductRegistryManifest();
    const tenantReg = getTenantProductRegistryManifest();
    const apiReg = getApiProductRegistryManifest();
    const reg = getDeploymentRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: E12_DEPLOYMENT_PACKAGE_ID,
      version: E12_DEPLOYMENT_PACKAGE_VERSION,
      packageCount: reg.packageCount,
      environmentCount: reg.environmentCount,
      configCount: reg.configCount,
      artifactCount: reg.artifactCount,
      tenantProductCount: tenantReg.tenantCount,
      apiCatalogCount: apiReg.catalogEntryCount,
      productIdentityCount: productReg.identityCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): DeploymentManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearDeploymentLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): DeploymentManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): DeploymentManagerSnapshot {
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
    createPackage: (input) => {
      assertRunning("createPackage");
      return createDeploymentPackage(input);
    },
    getPackage: getDeploymentPackage,
    listPackages: listDeploymentPackages,
    createEnvironment: (input) => {
      assertRunning("createEnvironment");
      return createEnvironmentProfile(input);
    },
    getEnvironment: getEnvironmentProfile,
    listEnvironments: listEnvironmentProfiles,
    setConfig: (input) => {
      assertRunning("setConfig");
      return setEnterpriseDeploymentConfig(input);
    },
    getConfig: getEnterpriseDeploymentConfig,
    listConfigs: listEnterpriseDeploymentConfigs,
    validate: (deploymentPackageId, options) => {
      assertRunning("validate");
      return validateDeploymentPackage(deploymentPackageId, options);
    },
    buildArtifact: (input) => {
      assertRunning("buildArtifact");
      return buildReleaseArtifact(input);
    },
    signArtifact: (id) => {
      assertRunning("signArtifact");
      return signReleaseArtifact(id);
    },
    distributeArtifact: (id) => {
      assertRunning("distributeArtifact");
      return distributeReleaseArtifact(id);
    },
    getArtifact: getReleaseArtifact,
    listArtifacts: listReleaseArtifacts,
    installationManifest: (input) => {
      assertRunning("installationManifest");
      return buildInstallationManifest(input);
    },
    manifest: getDeploymentRegistryManifest,
  };
}

export { assertDeploymentValidationPass, assertInstallationManifestReady };
