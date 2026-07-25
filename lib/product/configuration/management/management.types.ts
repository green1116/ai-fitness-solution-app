/**
 * Product Configuration — readiness / manifest types
 */

import type {
  CONFIGURATION_MANAGER_STATUSES,
  CONFIGURATION_READINESS_VERDICTS,
  PRODUCT_SYSTEM_CONFIGURATION_BASE,
  PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_ID,
  PRODUCT_SYSTEM_CONFIGURATION_VERSION,
} from "./management.constants";

export type ConfigurationReadinessVerdict =
  (typeof CONFIGURATION_READINESS_VERDICTS)[number];
export type ConfigurationManagerStatus =
  (typeof CONFIGURATION_MANAGER_STATUSES)[number];

export type ConfigurationReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ConfigurationReadinessResult = {
  verdict: ConfigurationReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ConfigurationReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ConfigurationRegistryManifest = {
  configurationId: typeof PRODUCT_SYSTEM_CONFIGURATION_ID;
  version: typeof PRODUCT_SYSTEM_CONFIGURATION_VERSION;
  freezeVersion: typeof PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION;
  base: typeof PRODUCT_SYSTEM_CONFIGURATION_BASE;
  namespaceCount: number;
  parameterCount: number;
  overrideCount: number;
  releaseCount: number;
};
