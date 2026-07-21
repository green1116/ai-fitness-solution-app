/**
 * Launch P1 — Production Launch Manager
 */

import { getDeploymentRegistryManifest } from "../product/e12/deployment/deployment.manager";
import { getProductRegistryManifest } from "../product/e12/registry/product.registry";
import {
  clearProductionArtifacts,
  getProductionArtifact,
  listProductionArtifacts,
  promoteProductionArtifact,
  registerProductionArtifact,
} from "./launch.artifact";
import {
  clearReleaseChecklists,
  createReleaseChecklist,
  getReleaseChecklist,
  listReleaseChecklists,
  markRequiredChecklistPassed,
  setChecklistItemStatus,
} from "./launch.checklist";
import {
  LAUNCH_PRODUCTION_FOUNDATION_BASE,
  LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_ID,
  LAUNCH_PRODUCTION_FOUNDATION_VERSION,
} from "./launch.constants";
import {
  assertLaunchManifestReady,
  buildLaunchManifest,
} from "./launch.manifest";
import {
  bindDeploymentPackageToProfile,
  clearProductionProfiles,
  createProductionProfile,
  getProductionProfile,
  listProductionProfiles,
  setProductionProfileStatus,
} from "./launch.profile";
import {
  assertDeploymentReadinessReady,
  evaluateDeploymentReadiness,
} from "./launch.readiness";
import type {
  CreateProductionProfileInput,
  DeploymentReadinessResult,
  LaunchManagerStatus,
  LaunchManifest,
  LaunchRegistryManifest,
  ProductionArtifact,
  ProductionProfile,
  RegisterProductionArtifactInput,
  ReleaseChecklist,
  SetChecklistItemStatusInput,
} from "./launch.types";

export type LaunchManagerSnapshot = {
  managerId: string;
  status: LaunchManagerStatus;
  layerId: typeof LAUNCH_PRODUCTION_FOUNDATION_ID;
  version: typeof LAUNCH_PRODUCTION_FOUNDATION_VERSION;
  profileCount: number;
  checklistCount: number;
  artifactCount: number;
  deploymentPackageCount: number;
  productIdentityCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ProductionLaunchManager = {
  initialize: () => LaunchManagerSnapshot;
  start: () => LaunchManagerSnapshot;
  stop: () => LaunchManagerSnapshot;
  status: () => LaunchManagerSnapshot;
  createProfile: (input: CreateProductionProfileInput) => ProductionProfile;
  getProfile: typeof getProductionProfile;
  listProfiles: typeof listProductionProfiles;
  setProfileStatus: typeof setProductionProfileStatus;
  bindDeploymentPackage: typeof bindDeploymentPackageToProfile;
  createChecklist: (input: {
    id?: string;
    productionProfileId: string;
  }) => ReleaseChecklist;
  setChecklistItem: (input: SetChecklistItemStatusInput) => ReleaseChecklist;
  markChecklistPassed: typeof markRequiredChecklistPassed;
  getChecklist: typeof getReleaseChecklist;
  listChecklists: typeof listReleaseChecklists;
  evaluateReadiness: (productionProfileId: string) => DeploymentReadinessResult;
  registerArtifact: (
    input: RegisterProductionArtifactInput,
  ) => ProductionArtifact;
  promoteArtifact: typeof promoteProductionArtifact;
  getArtifact: typeof getProductionArtifact;
  listArtifacts: typeof listProductionArtifacts;
  launchManifest: (input: { productionProfileId: string }) => LaunchManifest;
  manifest: () => LaunchRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getLaunchRegistryManifest(): LaunchRegistryManifest {
  return {
    launchId: LAUNCH_PRODUCTION_FOUNDATION_ID,
    version: LAUNCH_PRODUCTION_FOUNDATION_VERSION,
    freezeVersion: LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
    base: LAUNCH_PRODUCTION_FOUNDATION_BASE,
    profileCount: listProductionProfiles().length,
    checklistCount: listReleaseChecklists().length,
    artifactCount: listProductionArtifacts().length,
  };
}

export function clearLaunchLayer(): void {
  clearProductionArtifacts();
  clearReleaseChecklists();
  clearProductionProfiles();
}

export function createProductionLaunchManager(options?: {
  managerId?: string;
}): ProductionLaunchManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-p1-mgr");
  let state: LaunchManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): LaunchManagerSnapshot {
    const productReg = getProductRegistryManifest();
    const deployReg = getDeploymentRegistryManifest();
    const reg = getLaunchRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_PRODUCTION_FOUNDATION_ID,
      version: LAUNCH_PRODUCTION_FOUNDATION_VERSION,
      profileCount: reg.profileCount,
      checklistCount: reg.checklistCount,
      artifactCount: reg.artifactCount,
      deploymentPackageCount: deployReg.packageCount,
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

  function initialize(): LaunchManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearLaunchLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): LaunchManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): LaunchManagerSnapshot {
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
    createProfile: (input) => {
      assertRunning("createProfile");
      return createProductionProfile(input);
    },
    getProfile: getProductionProfile,
    listProfiles: listProductionProfiles,
    setProfileStatus: (id, status) => {
      assertRunning("setProfileStatus");
      return setProductionProfileStatus(id, status);
    },
    bindDeploymentPackage: (profileId, deploymentPackageId) => {
      assertRunning("bindDeploymentPackage");
      return bindDeploymentPackageToProfile(profileId, deploymentPackageId);
    },
    createChecklist: (input) => {
      assertRunning("createChecklist");
      return createReleaseChecklist(input);
    },
    setChecklistItem: (input) => {
      assertRunning("setChecklistItem");
      return setChecklistItemStatus(input);
    },
    markChecklistPassed: (checklistId) => {
      assertRunning("markChecklistPassed");
      return markRequiredChecklistPassed(checklistId);
    },
    getChecklist: getReleaseChecklist,
    listChecklists: listReleaseChecklists,
    evaluateReadiness: (productionProfileId) => {
      assertRunning("evaluateReadiness");
      return evaluateDeploymentReadiness(productionProfileId);
    },
    registerArtifact: (input) => {
      assertRunning("registerArtifact");
      return registerProductionArtifact(input);
    },
    promoteArtifact: (id) => {
      assertRunning("promoteArtifact");
      return promoteProductionArtifact(id);
    },
    getArtifact: getProductionArtifact,
    listArtifacts: listProductionArtifacts,
    launchManifest: (input) => {
      assertRunning("launchManifest");
      return buildLaunchManifest(input);
    },
    manifest: getLaunchRegistryManifest,
  };
}

export { assertDeploymentReadinessReady, assertLaunchManifestReady };
