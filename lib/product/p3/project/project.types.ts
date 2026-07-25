/**
 * Product P3 — Project types + readiness / manifest
 */

import type {
  P3_MANAGER_STATUSES,
  P3_READINESS_VERDICTS,
  PRODUCT_P3_AI_PROJECT_CREATION_BASE,
  PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION,
  PRODUCT_P3_AI_PROJECT_CREATION_ID,
  PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
  PROJECT_STATUSES,
} from "./project.constants";

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type P3ReadinessVerdict = (typeof P3_READINESS_VERDICTS)[number];
export type P3ManagerStatus = (typeof P3_MANAGER_STATUSES)[number];
export type ProjectMetadata = Record<string, unknown>;

export type AiProject = {
  id: string;
  organizationRef: string;
  name: string;
  templateId?: string;
  status: ProjectStatus;
  owner: string;
  detail: string;
  metadata: ProjectMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  id?: string;
  organizationRef: string;
  name: string;
  owner: string;
  templateId?: string;
  metadata?: ProjectMetadata;
};

export type UpdateProjectStatusInput = {
  projectId: string;
  status: ProjectStatus;
};

export type P3ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P3ReadinessResult = {
  verdict: P3ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P3ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P3RegistryManifest = {
  foundationId: typeof PRODUCT_P3_AI_PROJECT_CREATION_ID;
  version: typeof PRODUCT_P3_AI_PROJECT_CREATION_VERSION;
  freezeVersion: typeof PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION;
  base: typeof PRODUCT_P3_AI_PROJECT_CREATION_BASE;
  projectCount: number;
  templateCount: number;
  briefCount: number;
  siteCount: number;
  facilityCount: number;
  requirementCount: number;
  goalCount: number;
};
