/**
 * Launch P3 — Demo Environment Manager
 */

import { getLaunchRegistryManifest } from "../launch.manager";
import { getOnboardingRegistryManifest } from "../onboarding/onboarding.manager";
import {
  LAUNCH_DEMO_ENVIRONMENT_BASE,
  LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION,
  LAUNCH_DEMO_ENVIRONMENT_ID,
  LAUNCH_DEMO_ENVIRONMENT_VERSION,
} from "./demo.constants";
import { assertDemoReadinessReady, evaluateDemoReadiness } from "./demo.readiness";
import {
  createSampleDataProfile,
  getSampleDataProfile,
  listSampleDataProfiles,
  resetSampleDataProfile,
  seedSampleDataProfile,
  clearSampleDataProfiles,
} from "./demo.sample";
import {
  getDemoScenarioWorkflow,
  listDemoScenarioWorkflows,
  startDemoScenario,
  clearDemoScenarioWorkflows,
} from "./demo.scenario";
import {
  captureDemoSnapshot,
  getDemoSnapshot,
  listDemoSnapshots,
  resetDemoEnvironment,
  restoreDemoSnapshot,
  clearDemoSnapshots,
} from "./demo.snapshot";
import {
  createDemoTenant,
  getDemoTenant,
  listDemoTenants,
  clearDemoTenants,
} from "./demo.tenant";
import {
  createDemoWorkspace,
  getDemoWorkspace,
  listDemoWorkspaces,
  clearDemoWorkspaces,
} from "./demo.workspace";
import type {
  CaptureDemoSnapshotInput,
  CreateDemoTenantInput,
  CreateDemoWorkspaceInput,
  CreateSampleDataProfileInput,
  DemoManagerStatus,
  DemoReadinessResult,
  DemoRegistryManifest,
  DemoScenarioWorkflow,
  DemoSnapshot,
  DemoTenant,
  DemoWorkspace,
  SampleDataProfile,
  StartDemoScenarioInput,
} from "./demo.types";

export type DemoManagerSnapshot = {
  managerId: string;
  status: DemoManagerStatus;
  layerId: typeof LAUNCH_DEMO_ENVIRONMENT_ID;
  version: typeof LAUNCH_DEMO_ENVIRONMENT_VERSION;
  tenantCount: number;
  workspaceCount: number;
  sampleProfileCount: number;
  scenarioCount: number;
  snapshotCount: number;
  launchProfileCount: number;
  onboardingProfileCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type DemoEnvironmentManager = {
  initialize: () => DemoManagerSnapshot;
  start: () => DemoManagerSnapshot;
  stop: () => DemoManagerSnapshot;
  status: () => DemoManagerSnapshot;
  createTenant: (input: CreateDemoTenantInput) => DemoTenant;
  getTenant: typeof getDemoTenant;
  listTenants: typeof listDemoTenants;
  createWorkspace: (input: CreateDemoWorkspaceInput) => DemoWorkspace;
  getWorkspace: typeof getDemoWorkspace;
  listWorkspaces: typeof listDemoWorkspaces;
  createSampleProfile: (input: CreateSampleDataProfileInput) => SampleDataProfile;
  seedSample: (id: string) => SampleDataProfile;
  resetSample: (id: string) => SampleDataProfile;
  getSampleProfile: typeof getSampleDataProfile;
  listSampleProfiles: typeof listSampleDataProfiles;
  startScenario: (input: StartDemoScenarioInput) => DemoScenarioWorkflow;
  getScenario: typeof getDemoScenarioWorkflow;
  listScenarios: typeof listDemoScenarioWorkflows;
  captureSnapshot: (input: CaptureDemoSnapshotInput) => DemoSnapshot;
  restoreSnapshot: (id: string) => DemoSnapshot;
  resetEnvironment: (demoTenantId: string) => {
    tenantId: string;
    sampleReset: number;
    snapshotCount: number;
  };
  getSnapshot: typeof getDemoSnapshot;
  listSnapshots: typeof listDemoSnapshots;
  evaluateReadiness: (demoTenantId: string) => DemoReadinessResult;
  manifest: () => DemoRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getDemoRegistryManifest(): DemoRegistryManifest {
  return {
    demoEnvironmentId: LAUNCH_DEMO_ENVIRONMENT_ID,
    version: LAUNCH_DEMO_ENVIRONMENT_VERSION,
    freezeVersion: LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION,
    base: LAUNCH_DEMO_ENVIRONMENT_BASE,
    tenantCount: listDemoTenants().length,
    workspaceCount: listDemoWorkspaces().length,
    sampleProfileCount: listSampleDataProfiles().length,
    scenarioCount: listDemoScenarioWorkflows().length,
    snapshotCount: listDemoSnapshots().length,
  };
}

export function clearDemoLayer(): void {
  clearDemoScenarioWorkflows();
  clearDemoSnapshots();
  clearSampleDataProfiles();
  clearDemoWorkspaces();
  clearDemoTenants();
}

export function createDemoEnvironmentManager(options?: {
  managerId?: string;
}): DemoEnvironmentManager {
  const managerId = options?.managerId?.trim() || createId("launch-p3-mgr");
  let state: DemoManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): DemoManagerSnapshot {
    const launchReg = getLaunchRegistryManifest();
    const onboardReg = getOnboardingRegistryManifest();
    const reg = getDemoRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_DEMO_ENVIRONMENT_ID,
      version: LAUNCH_DEMO_ENVIRONMENT_VERSION,
      tenantCount: reg.tenantCount,
      workspaceCount: reg.workspaceCount,
      sampleProfileCount: reg.sampleProfileCount,
      scenarioCount: reg.scenarioCount,
      snapshotCount: reg.snapshotCount,
      launchProfileCount: launchReg.profileCount,
      onboardingProfileCount: onboardReg.profileCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): DemoManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearDemoLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): DemoManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): DemoManagerSnapshot {
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
    createTenant: (input) => {
      assertRunning("createTenant");
      return createDemoTenant(input);
    },
    getTenant: getDemoTenant,
    listTenants: listDemoTenants,
    createWorkspace: (input) => {
      assertRunning("createWorkspace");
      return createDemoWorkspace(input);
    },
    getWorkspace: getDemoWorkspace,
    listWorkspaces: listDemoWorkspaces,
    createSampleProfile: (input) => {
      assertRunning("createSampleProfile");
      return createSampleDataProfile(input);
    },
    seedSample: (id) => {
      assertRunning("seedSample");
      return seedSampleDataProfile(id);
    },
    resetSample: (id) => {
      assertRunning("resetSample");
      return resetSampleDataProfile(id);
    },
    getSampleProfile: getSampleDataProfile,
    listSampleProfiles: listSampleDataProfiles,
    startScenario: (input) => {
      assertRunning("startScenario");
      return startDemoScenario(input);
    },
    getScenario: getDemoScenarioWorkflow,
    listScenarios: listDemoScenarioWorkflows,
    captureSnapshot: (input) => {
      assertRunning("captureSnapshot");
      return captureDemoSnapshot(input);
    },
    restoreSnapshot: (id) => {
      assertRunning("restoreSnapshot");
      return restoreDemoSnapshot(id);
    },
    resetEnvironment: (demoTenantId) => {
      assertRunning("resetEnvironment");
      return resetDemoEnvironment(demoTenantId);
    },
    getSnapshot: getDemoSnapshot,
    listSnapshots: listDemoSnapshots,
    evaluateReadiness: (demoTenantId) => {
      assertRunning("evaluateReadiness");
      return evaluateDemoReadiness(demoTenantId);
    },
    manifest: getDemoRegistryManifest,
  };
}

export { assertDemoReadinessReady };
