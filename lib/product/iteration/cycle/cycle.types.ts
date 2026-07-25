/**
 * Product Iteration — Cycle types + readiness / manifest
 */

import type {
  CYCLE_STATUSES,
  ITERATION_MANAGER_STATUSES,
  ITERATION_READINESS_VERDICTS,
  PRODUCT_ITERATION_FOUNDATION_BASE,
  PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ITERATION_FOUNDATION_ID,
  PRODUCT_ITERATION_FOUNDATION_VERSION,
} from "./cycle.constants";

export type CycleStatus = (typeof CYCLE_STATUSES)[number];
export type IterationReadinessVerdict =
  (typeof ITERATION_READINESS_VERDICTS)[number];
export type IterationManagerStatus =
  (typeof ITERATION_MANAGER_STATUSES)[number];
export type CycleMetadata = Record<string, unknown>;

export type IterationCycle = {
  id: string;
  name: string;
  goal: string;
  owner: string;
  status: CycleStatus;
  detail: string;
  metadata: CycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateCycleInput = {
  id?: string;
  name: string;
  goal: string;
  owner: string;
  metadata?: CycleMetadata;
};

export type UpdateCycleStatusInput = {
  cycleId: string;
  status: CycleStatus;
};

export type IterationReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IterationReadinessResult = {
  verdict: IterationReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IterationReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IterationRegistryManifest = {
  foundationId: typeof PRODUCT_ITERATION_FOUNDATION_ID;
  version: typeof PRODUCT_ITERATION_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_ITERATION_FOUNDATION_BASE;
  cycleCount: number;
  backlogCount: number;
  experimentCount: number;
  roadmapCount: number;
  impactCount: number;
  cadenceCount: number;
};
