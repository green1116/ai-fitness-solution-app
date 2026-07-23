/**
 * Launch L1 — Project types
 */

import type { PROJECT_SCENARIO_KINDS } from "../demo/demo.constants";

export type ProjectScenarioKind = (typeof PROJECT_SCENARIO_KINDS)[number];
export type ProjectMetadata = Record<string, unknown>;

export type DemoProject = {
  id: string;
  tenantId: string;
  customerId: string;
  name: string;
  kind: ProjectScenarioKind;
  objective: string;
  detail: string;
  metadata: ProjectMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectScenarioInput = {
  id?: string;
  tenantId: string;
  customerId: string;
  name: string;
  kind: ProjectScenarioKind;
  objective?: string;
  metadata?: ProjectMetadata;
};
