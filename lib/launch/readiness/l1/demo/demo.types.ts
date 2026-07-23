/**
 * Launch L1 — Demo types + readiness / manifest
 */

import type {
  DEMO_LOAD_STATUSES,
  L1_MANAGER_STATUSES,
  L1_READINESS_VERDICTS,
  LAUNCH_L1_DEMO_FOUNDATION_BASE,
  LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
  LAUNCH_L1_DEMO_FOUNDATION_ID,
  LAUNCH_L1_DEMO_FOUNDATION_VERSION,
} from "./demo.constants";

export type DemoLoadStatus = (typeof DEMO_LOAD_STATUSES)[number];
export type L1ReadinessVerdict = (typeof L1_READINESS_VERDICTS)[number];
export type L1ManagerStatus = (typeof L1_MANAGER_STATUSES)[number];
export type DemoMetadata = Record<string, unknown>;

export type DemoBundle = {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  status: DemoLoadStatus;
  seedCount: number;
  artifactIds: string[];
  detail: string;
  metadata: DemoMetadata;
  loadedAt: string;
};

export type LoadDemoInput = {
  id?: string;
  tenantId: string;
  projectId: string;
  name?: string;
  metadata?: DemoMetadata;
};

export type DemoSeed = {
  id: string;
  bundleId: string;
  label: string;
  payloadKeys: string[];
  detail: string;
  seededAt: string;
};

export type SeedDemoInput = {
  id?: string;
  bundleId: string;
  label: string;
  payload?: Record<string, unknown>;
};

export type L1ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type L1ReadinessResult = {
  verdict: L1ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: L1ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type L1RegistryManifest = {
  foundationId: typeof LAUNCH_L1_DEMO_FOUNDATION_ID;
  version: typeof LAUNCH_L1_DEMO_FOUNDATION_VERSION;
  freezeVersion: typeof LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION;
  base: typeof LAUNCH_L1_DEMO_FOUNDATION_BASE;
  tenantCount: number;
  customerCount: number;
  projectCount: number;
  artifactCount: number;
  bundleCount: number;
  seedCount: number;
};
