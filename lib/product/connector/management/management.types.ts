/**
 * Product Connector — readiness / manifest types
 */

import type {
  CONNECTOR_MANAGER_STATUSES,
  CONNECTOR_READINESS_VERDICTS,
  PRODUCT_CONNECTOR_FRAMEWORK_BASE,
  PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_CONNECTOR_FRAMEWORK_ID,
  PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
} from "./management.constants";

export type ConnectorReadinessVerdict =
  (typeof CONNECTOR_READINESS_VERDICTS)[number];
export type ConnectorManagerStatus =
  (typeof CONNECTOR_MANAGER_STATUSES)[number];

export type ConnectorReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ConnectorReadinessResult = {
  verdict: ConnectorReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ConnectorReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ConnectorRegistryManifest = {
  frameworkId: typeof PRODUCT_CONNECTOR_FRAMEWORK_ID;
  version: typeof PRODUCT_CONNECTOR_FRAMEWORK_VERSION;
  freezeVersion: typeof PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION;
  base: typeof PRODUCT_CONNECTOR_FRAMEWORK_BASE;
  connectorCount: number;
  definitionCount: number;
  contractCount: number;
  bindingCount: number;
  releaseCount: number;
};
