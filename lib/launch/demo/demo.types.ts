/**
 * Launch P3 — Demo Environment types
 */

import type {
  DEMO_MANAGER_STATUSES,
  DEMO_READINESS_VERDICTS,
  DEMO_SCENARIO_STEP_STATUSES,
  DEMO_SCENARIO_STEPS,
  DEMO_TENANT_STATUSES,
  DEMO_WORKSPACE_STATUSES,
  LAUNCH_DEMO_ENVIRONMENT_BASE,
  LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION,
  LAUNCH_DEMO_ENVIRONMENT_ID,
  LAUNCH_DEMO_ENVIRONMENT_VERSION,
  SAMPLE_DATA_KINDS,
  SNAPSHOT_STATUSES,
} from "./demo.constants";

export type DemoTenantStatus = (typeof DEMO_TENANT_STATUSES)[number];
export type DemoWorkspaceStatus = (typeof DEMO_WORKSPACE_STATUSES)[number];
export type SampleDataKind = (typeof SAMPLE_DATA_KINDS)[number];
export type DemoScenarioStep = (typeof DEMO_SCENARIO_STEPS)[number];
export type DemoScenarioStepStatus =
  (typeof DEMO_SCENARIO_STEP_STATUSES)[number];
export type SnapshotStatus = (typeof SNAPSHOT_STATUSES)[number];
export type DemoReadinessVerdict = (typeof DEMO_READINESS_VERDICTS)[number];
export type DemoManagerStatus = (typeof DEMO_MANAGER_STATUSES)[number];

export type DemoMetadata = Record<string, unknown>;

/** Demo tenant model. */
export type DemoTenant = {
  id: string;
  name: string;
  productId: string;
  productionProfileId: string;
  onboardingProfileId?: string;
  productTenantId?: string;
  demoWorkspaceId?: string;
  deploymentPackageId?: string;
  status: DemoTenantStatus;
  metadata: DemoMetadata;
  createdAt: string;
};

export type CreateDemoTenantInput = {
  id?: string;
  name: string;
  productId: string;
  productionProfileId: string;
  onboardingProfileId?: string;
  deploymentPackageId?: string;
  status?: DemoTenantStatus;
  metadata?: DemoMetadata;
};

/** Demo workspace. */
export type DemoWorkspace = {
  id: string;
  demoTenantId: string;
  workspaceId: string;
  name: string;
  slug: string;
  status: DemoWorkspaceStatus;
  metadata: DemoMetadata;
  createdAt: string;
};

export type CreateDemoWorkspaceInput = {
  id?: string;
  demoTenantId: string;
  name?: string;
  slug?: string;
  status?: DemoWorkspaceStatus;
  metadata?: DemoMetadata;
};

/** Sample data profile. */
export type SampleDataEntry = {
  kind: SampleDataKind;
  count: number;
  seedKey: string;
};

export type SampleDataProfile = {
  id: string;
  demoTenantId: string;
  name: string;
  entries: SampleDataEntry[];
  seeded: boolean;
  metadata: DemoMetadata;
  createdAt: string;
};

export type CreateSampleDataProfileInput = {
  id?: string;
  demoTenantId: string;
  name: string;
  entries?: SampleDataEntry[];
  metadata?: DemoMetadata;
};

/** Demo scenario workflow. */
export type DemoScenarioStepRecord = {
  step: DemoScenarioStep;
  status: DemoScenarioStepStatus;
  detail: string;
  completedAt?: string;
};

export type DemoScenarioWorkflow = {
  id: string;
  demoTenantId: string;
  sampleDataProfileId: string;
  steps: DemoScenarioStepRecord[];
  currentStep?: DemoScenarioStep;
  complete: boolean;
  failed: boolean;
  updatedAt: string;
};

export type StartDemoScenarioInput = {
  id?: string;
  demoTenantId: string;
  sampleDataProfileId: string;
};

/** Snapshot / reset. */
export type DemoSnapshot = {
  id: string;
  demoTenantId: string;
  sampleDataProfileId: string;
  status: SnapshotStatus;
  checksum: string;
  payload: {
    entryCounts: Record<string, number>;
    workspaceId?: string;
    productTenantId?: string;
  };
  capturedAt: string;
  restoredAt?: string;
};

export type CaptureDemoSnapshotInput = {
  id?: string;
  demoTenantId: string;
  sampleDataProfileId: string;
};

/** Demo readiness. */
export type DemoReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type DemoReadinessResult = {
  demoTenantId: string;
  verdict: DemoReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: DemoReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type DemoRegistryManifest = {
  demoEnvironmentId: typeof LAUNCH_DEMO_ENVIRONMENT_ID;
  version: typeof LAUNCH_DEMO_ENVIRONMENT_VERSION;
  freezeVersion: typeof LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION;
  base: typeof LAUNCH_DEMO_ENVIRONMENT_BASE;
  tenantCount: number;
  workspaceCount: number;
  sampleProfileCount: number;
  scenarioCount: number;
  snapshotCount: number;
};
