/**
 * E07-P1 — Digital Workforce Foundation types
 * Abstraction above E06 Autonomous Enterprise OS
 */

import {
  E07_WORKFORCE_BASE,
  E07_WORKFORCE_FREEZE_VERSION,
  E07_WORKFORCE_PLATFORM_ID,
  E07_WORKFORCE_VERSION,
  SKILL_KINDS,
  WORKER_ROLES,
  WORKER_STATUSES,
  WORKFORCE_LIFECYCLE_STAGES,
} from "./workforce.constants";

export type WorkerRole = (typeof WORKER_ROLES)[number];
export type WorkerStatus = (typeof WORKER_STATUSES)[number];
export type WorkforceLifecycleStage =
  (typeof WORKFORCE_LIFECYCLE_STAGES)[number];
export type SkillKind = (typeof SKILL_KINDS)[number];

export type WorkerDefinition = {
  id: string;
  name: string;
  role: WorkerRole;
  description: string;
  /** Bound E06 autonomous operation id */
  operationId: string;
  skillIds: string[];
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type WorkforceLifecycleTransition = {
  from: WorkforceLifecycleStage;
  to: WorkforceLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type WorkforceLifecycle = {
  current: WorkforceLifecycleStage;
  stages: WorkforceLifecycleStage[];
  transitions: WorkforceLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type WorkforceRegistryManifest = {
  platformId: typeof E07_WORKFORCE_PLATFORM_ID;
  version: typeof E07_WORKFORCE_VERSION;
  freezeVersion: typeof E07_WORKFORCE_FREEZE_VERSION;
  base: typeof E07_WORKFORCE_BASE;
  workerCount: number;
  roles: WorkerRole[];
  workers: WorkerDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type WorkforceFoundationResult = {
  platformId: typeof E07_WORKFORCE_PLATFORM_ID;
  version: typeof E07_WORKFORCE_VERSION;
  freezeVersion: typeof E07_WORKFORCE_FREEZE_VERSION;
  base: typeof E07_WORKFORCE_BASE;
  registry: WorkforceRegistryManifest;
  lifecycle: WorkforceLifecycle;
  ready: boolean;
  summary: string;
};
