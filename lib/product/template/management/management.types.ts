/**
 * Product Template — readiness / manifest types
 */

import type {
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
  TEMPLATE_MANAGER_STATUSES,
  TEMPLATE_READINESS_VERDICTS,
} from "./management.constants";

export type TemplateReadinessVerdict =
  (typeof TEMPLATE_READINESS_VERDICTS)[number];
export type TemplateManagerStatus = (typeof TEMPLATE_MANAGER_STATUSES)[number];

export type TemplateReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type TemplateReadinessResult = {
  verdict: TemplateReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: TemplateReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type TemplateRegistryManifest = {
  managementId: typeof PRODUCT_TEMPLATE_MANAGEMENT_ID;
  version: typeof PRODUCT_TEMPLATE_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_TEMPLATE_MANAGEMENT_BASE;
  definitionCount: number;
  variantCount: number;
  variableCount: number;
  publishCount: number;
};
