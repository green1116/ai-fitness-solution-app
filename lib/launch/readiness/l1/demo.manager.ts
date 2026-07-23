/**
 * Launch L1 — Demo Foundation Manager
 */

import {
  clearArtifacts,
  getArtifact,
  listArtifacts,
  registerArtifact,
} from "./artifact/artifact.registry";
import type {
  DemoArtifact,
  RegisterArtifactInput,
} from "./artifact/artifact.types";
import {
  clearCustomerProfiles,
  createCustomerProfile,
  getCustomerProfile,
  listCustomerProfiles,
} from "./customer/customer.profile";
import type {
  CreateCustomerProfileInput,
  CustomerProfile,
} from "./customer/customer.types";
import {
  LAUNCH_L1_DEMO_FOUNDATION_BASE,
  LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
  LAUNCH_L1_DEMO_FOUNDATION_ID,
  LAUNCH_L1_DEMO_FOUNDATION_VERSION,
} from "./demo/demo.constants";
import {
  clearDemoBundles,
  getDemoBundle,
  listDemoBundles,
  loadDemoBundle,
} from "./demo/demo.loader";
import {
  assertL1DemoReadinessReady,
  evaluateL1DemoReadiness,
} from "./demo/demo.readiness";
import {
  clearDemoSeeds,
  getDemoSeed,
  listDemoSeeds,
  seedDemoData,
} from "./demo/demo.seed";
import type {
  DemoBundle,
  DemoSeed,
  L1ManagerStatus,
  L1ReadinessResult,
  L1RegistryManifest,
  LoadDemoInput,
  SeedDemoInput,
} from "./demo/demo.types";
import {
  clearProjectScenarios,
  createProjectScenario,
  getProjectScenario,
  listProjectScenarios,
} from "./project/project.scenario";
import type {
  CreateProjectScenarioInput,
  DemoProject,
} from "./project/project.types";
import {
  clearTenants,
  getTenant,
  listTenants,
  registerTenant,
} from "./tenant/tenant.registry";
import type { DemoTenant, RegisterTenantInput } from "./tenant/tenant.types";

export type L1DemoFoundationManagerSnapshot = {
  managerId: string;
  status: L1ManagerStatus;
  layerId: typeof LAUNCH_L1_DEMO_FOUNDATION_ID;
  version: typeof LAUNCH_L1_DEMO_FOUNDATION_VERSION;
  tenantCount: number;
  customerCount: number;
  projectCount: number;
  artifactCount: number;
  bundleCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type L1DemoFoundationManager = {
  initialize: () => L1DemoFoundationManagerSnapshot;
  start: () => L1DemoFoundationManagerSnapshot;
  stop: () => L1DemoFoundationManagerSnapshot;
  status: () => L1DemoFoundationManagerSnapshot;
  registerTenant: (input: RegisterTenantInput) => DemoTenant;
  createCustomer: (input: CreateCustomerProfileInput) => CustomerProfile;
  createProject: (input: CreateProjectScenarioInput) => DemoProject;
  registerArtifact: (input: RegisterArtifactInput) => DemoArtifact;
  loadDemo: (input: LoadDemoInput) => DemoBundle;
  seedDemo: (input: SeedDemoInput) => DemoSeed;
  evaluateReadiness: () => L1ReadinessResult;
  manifest: () => L1RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getL1RegistryManifest(): L1RegistryManifest {
  return {
    foundationId: LAUNCH_L1_DEMO_FOUNDATION_ID,
    version: LAUNCH_L1_DEMO_FOUNDATION_VERSION,
    freezeVersion: LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
    base: LAUNCH_L1_DEMO_FOUNDATION_BASE,
    tenantCount: listTenants().length,
    customerCount: listCustomerProfiles().length,
    projectCount: listProjectScenarios().length,
    artifactCount: listArtifacts().length,
    bundleCount: listDemoBundles().length,
    seedCount: listDemoSeeds().length,
  };
}

export function clearL1DemoFoundationLayer(): void {
  clearDemoSeeds();
  clearDemoBundles();
  clearArtifacts();
  clearProjectScenarios();
  clearCustomerProfiles();
  clearTenants();
}

export function createL1DemoFoundationManager(options?: {
  managerId?: string;
}): L1DemoFoundationManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-l1-demo-mgr");
  let state: L1ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): L1DemoFoundationManagerSnapshot {
    const reg = getL1RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_L1_DEMO_FOUNDATION_ID,
      version: LAUNCH_L1_DEMO_FOUNDATION_VERSION,
      tenantCount: reg.tenantCount,
      customerCount: reg.customerCount,
      projectCount: reg.projectCount,
      artifactCount: reg.artifactCount,
      bundleCount: reg.bundleCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): L1DemoFoundationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearL1DemoFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): L1DemoFoundationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): L1DemoFoundationManagerSnapshot {
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
    registerTenant: (input) => {
      assertRunning("registerTenant");
      return registerTenant(input);
    },
    createCustomer: (input) => {
      assertRunning("createCustomer");
      return createCustomerProfile(input);
    },
    createProject: (input) => {
      assertRunning("createProject");
      return createProjectScenario(input);
    },
    registerArtifact: (input) => {
      assertRunning("registerArtifact");
      return registerArtifact(input);
    },
    loadDemo: (input) => {
      assertRunning("loadDemo");
      return loadDemoBundle(input);
    },
    seedDemo: (input) => {
      assertRunning("seedDemo");
      return seedDemoData(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateL1DemoReadiness();
    },
    manifest: getL1RegistryManifest,
  };
}

export {
  assertL1DemoReadinessReady,
  getArtifact,
  getCustomerProfile,
  getDemoBundle,
  getDemoSeed,
  getProjectScenario,
  getTenant,
  listArtifacts,
  listCustomerProfiles,
  listDemoBundles,
  listDemoSeeds,
  listProjectScenarios,
  listTenants,
};
