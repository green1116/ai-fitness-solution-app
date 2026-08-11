/**
 * RSO-8 — Runtime Operations Baseline references
 * Freeze-only contract; does not mutate post-ga-production-baseline-v1.
 */

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../../release/ga-release";
import {
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
} from "../../release/health/release-health-registry";

export const RSO_8_ID = "RSO-8" as const;
export const RUNTIME_OPERATIONS_FREEZE_CAPABILITY =
  "RuntimeOperationsFreeze" as const;
export const RUNTIME_OPERATIONS_FREEZE_VERSION =
  "rso-8-runtime-operations-freeze-1.0.0" as const;
export const RUNTIME_OPERATIONS_FREEZE_CODENAME =
  "Enterprise SaaS Runtime Operations v1 Freeze" as const;
export const RUNTIME_OPERATIONS_FREEZE_DATE = "2026-08-11" as const;

/** RSO-7 operations feedback pack baseline (freeze parent pack). */
export const RSO7_OPERATIONS_FEEDBACK_BASELINE =
  "rso7-operations-feedback-v1" as const;

/** Product-level freeze label for RSO-1..RSO-7 closure. */
export const ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1 =
  "enterprise-saas-runtime-operations-v1" as const;

export type RuntimeOperationsBaseline = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;
  packBaseline: typeof RSO7_OPERATIONS_FEEDBACK_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  productionBaselineImmutable: true;
}>;

export function buildRuntimeOperationsBaseline(): RuntimeOperationsBaseline {
  return {
    productBaseline: ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    packBaseline: RSO7_OPERATIONS_FEEDBACK_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaBaseline: GA_RELEASE_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    productionBaselineImmutable: true,
  };
}
