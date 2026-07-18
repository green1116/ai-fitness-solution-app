/**
 * E07-P7 — Autonomous Organization types
 * Organization layer above E07 Workforce Learning Loop
 */

import type { LearningLoopResult } from "../learning/learning.types";
import {
  E07_ORGANIZATION_BASE,
  E07_ORGANIZATION_FREEZE_VERSION,
  E07_ORGANIZATION_ID,
  E07_ORGANIZATION_VERSION,
  ORGANIZATION_INSTANCE_PHASES,
  ORGANIZATION_KINDS,
} from "./organization.constants";

export type OrganizationKind = (typeof ORGANIZATION_KINDS)[number];
export type OrganizationInstancePhase =
  (typeof ORGANIZATION_INSTANCE_PHASES)[number];

export type OrganizationDefinition = {
  id: string;
  name: string;
  kind: OrganizationKind;
  mission: string;
  description: string;
  /** Ordered E07 learning ids executed as organizational units */
  learningIds: string[];
  optional: boolean;
  readOnly: true;
};

export type OrganizationPlanUnit = {
  id: string;
  order: number;
  learningId: string;
  learningKind: string;
  collaborationId: string;
  title: string;
  detail: string;
  readOnly: true;
};

export type OrganizationPlan = {
  organizationId: string;
  kind: OrganizationKind;
  mission: string;
  unitCount: number;
  units: OrganizationPlanUnit[];
  narrative: string;
  readOnly: true;
};

export type OrganizationUnitResult = {
  unitId: string;
  order: number;
  learningId: string;
  success: boolean;
  status: LearningLoopResult["status"];
  baselineScore: number;
  updatedScore: number;
  durationMs: number;
  errorMessage?: string;
  readOnly: true;
};

export type OrganizationExecutionResult = {
  success: boolean;
  organizationId: string;
  kind: OrganizationKind;
  mission: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  plan: OrganizationPlan;
  unitResults: OrganizationUnitResult[];
  completedUnits: number;
  learningIds: string[];
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type OrganizationRegistryManifest = {
  organizationId: typeof E07_ORGANIZATION_ID;
  version: typeof E07_ORGANIZATION_VERSION;
  freezeVersion: typeof E07_ORGANIZATION_FREEZE_VERSION;
  base: typeof E07_ORGANIZATION_BASE;
  organizationCount: number;
  kinds: OrganizationKind[];
  organizations: OrganizationDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
