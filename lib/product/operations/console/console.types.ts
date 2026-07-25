/**
 * Product Operations — readiness / manifest types
 */

import type {
  OPERATIONS_MANAGER_STATUSES,
  OPERATIONS_READINESS_VERDICTS,
  PRODUCT_OPERATIONS_CONSOLE_BASE,
  PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION,
  PRODUCT_OPERATIONS_CONSOLE_ID,
  PRODUCT_OPERATIONS_CONSOLE_VERSION,
} from "./console.constants";

export type OperationsReadinessVerdict =
  (typeof OPERATIONS_READINESS_VERDICTS)[number];
export type OperationsManagerStatus =
  (typeof OPERATIONS_MANAGER_STATUSES)[number];

export type OperationsReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OperationsReadinessResult = {
  verdict: OperationsReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OperationsReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OperationsRegistryManifest = {
  consoleId: typeof PRODUCT_OPERATIONS_CONSOLE_ID;
  version: typeof PRODUCT_OPERATIONS_CONSOLE_VERSION;
  freezeVersion: typeof PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION;
  base: typeof PRODUCT_OPERATIONS_CONSOLE_BASE;
  surfaceCount: number;
  incidentCount: number;
  playbookCount: number;
  dispatchCount: number;
};
