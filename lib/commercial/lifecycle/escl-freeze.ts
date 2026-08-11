/**
 * ESCL v1 Freeze — Enterprise SaaS Customer Lifecycle v1
 * Freezes State → Transition → Action → Review.
 * Base: enterprise-saas-commercial-execution-v1.
 * Freeze only — no ESCE mutation / persistence / runtime side effects.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../../release/ga-release";
import {
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
} from "../../release/health/release-health-registry";
import { RELEASE_ID } from "../../release/release-readiness";
import { ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1 } from "../execution";
import {
  CUSTOMER_LIFECYCLE_STATE_CAPABILITY,
  CUSTOMER_LIFECYCLE_STATE_VERSION,
  ESCE_V1_BASELINE,
  ESCL_1_ID,
  getCustomerLifecycleState,
} from "./customer-lifecycle-state";
import {
  ESCL2_LIFECYCLE_TRANSITION_BASELINE,
  ESCL_3_ID,
  LIFECYCLE_ACTION_CAPABILITY,
  LIFECYCLE_ACTION_VERSION,
  getLifecycleAction,
} from "./lifecycle-action";
import {
  ESCL_4_ID,
  LIFECYCLE_REVIEW_CAPABILITY,
  LIFECYCLE_REVIEW_VERSION,
  ESCL3_LIFECYCLE_ACTION_BASELINE,
  buildLifecycleReview,
  getLifecycleReview,
  type LifecycleReview,
} from "./lifecycle-review";
import {
  ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE,
  ESCL_2_ID,
  LIFECYCLE_TRANSITION_CAPABILITY,
  LIFECYCLE_TRANSITION_VERSION,
  getLifecycleTransition,
} from "./lifecycle-transition";

export const ESCL_FREEZE_ID = "ESCL-Freeze" as const;
export const ESCL_FREEZE_CAPABILITY = "EsclCustomerLifecycleFreeze" as const;
export const ESCL_FREEZE_VERSION = "escl-freeze-1.0.0" as const;
export const ESCL_FREEZE_CODENAME =
  "Enterprise SaaS Customer Lifecycle v1 Freeze" as const;
export const ESCL_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1 =
  "enterprise-saas-customer-lifecycle-v1" as const;

export type EsclComponentStatus = "frozen";

export type EsclComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EsclComponentStatus;
}>;

export const ESCL_COMPONENTS: readonly EsclComponentEntry[] = [
  {
    id: ESCL_1_ID,
    name: "Customer Lifecycle State",
    capability: CUSTOMER_LIFECYCLE_STATE_CAPABILITY,
    version: CUSTOMER_LIFECYCLE_STATE_VERSION,
    baselineTag: ESCE_V1_BASELINE,
    modulePath: "lib/commercial/lifecycle/customer-lifecycle-state.ts",
    verifyScript: "scripts/verify-escl-1-customer-lifecycle-state.ts",
    buildApi: "buildCustomerLifecycleState",
    status: "frozen",
  },
  {
    id: ESCL_2_ID,
    name: "Lifecycle Transition",
    capability: LIFECYCLE_TRANSITION_CAPABILITY,
    version: LIFECYCLE_TRANSITION_VERSION,
    baselineTag: ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE,
    modulePath: "lib/commercial/lifecycle/lifecycle-transition.ts",
    verifyScript: "scripts/verify-escl-2-lifecycle-transition.ts",
    buildApi: "buildLifecycleTransition",
    status: "frozen",
  },
  {
    id: ESCL_3_ID,
    name: "Lifecycle Action",
    capability: LIFECYCLE_ACTION_CAPABILITY,
    version: LIFECYCLE_ACTION_VERSION,
    baselineTag: ESCL2_LIFECYCLE_TRANSITION_BASELINE,
    modulePath: "lib/commercial/lifecycle/lifecycle-action.ts",
    verifyScript: "scripts/verify-escl-3-lifecycle-action.ts",
    buildApi: "buildLifecycleAction",
    status: "frozen",
  },
  {
    id: ESCL_4_ID,
    name: "Lifecycle Review",
    capability: LIFECYCLE_REVIEW_CAPABILITY,
    version: LIFECYCLE_REVIEW_VERSION,
    baselineTag: ESCL3_LIFECYCLE_ACTION_BASELINE,
    modulePath: "lib/commercial/lifecycle/lifecycle-review.ts",
    verifyScript: "scripts/verify-escl-v1-freeze.ts",
    buildApi: "buildLifecycleReview",
    status: "frozen",
  },
] as const;

export type EsclFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1;
  executionBaseline: typeof ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1;
  packBaseline: typeof ESCL3_LIFECYCLE_ACTION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EsclComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESCL_FREEZE_VERSION;
    "ESCL-1": typeof CUSTOMER_LIFECYCLE_STATE_VERSION;
    "ESCL-2": typeof LIFECYCLE_TRANSITION_VERSION;
    "ESCL-3": typeof LIFECYCLE_ACTION_VERSION;
    "ESCL-4": typeof LIFECYCLE_REVIEW_VERSION;
  };
  componentFingerprints: {
    "ESCL-1": string;
    "ESCL-2": string;
    "ESCL-3": string;
    "ESCL-4": string;
  };
}>;

export type EsclFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCL_FREEZE_ID;
  capability: typeof ESCL_FREEZE_CAPABILITY;
  version: typeof ESCL_FREEZE_VERSION;
  codename: typeof ESCL_FREEZE_CODENAME;
  freezeDate: typeof ESCL_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1;
  executionBaseline: typeof ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EsclFreezeManifest;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESCL-1~ESCL-4";
    closure: "ESCL-Freeze";
    product: "Enterprise SaaS Customer Lifecycle v1";
    immutable: true;
    freezeOnly: true;
    noEsceMutation: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: EsclFreeze | null = null;

function cloneFreeze(row: EsclFreeze): EsclFreeze {
  return {
    ...row,
    manifest: {
      ...row.manifest,
      components: row.manifest.components.map((c) => ({ ...c })),
      versionReferences: { ...row.manifest.versionReferences },
      componentFingerprints: { ...row.manifest.componentFingerprints },
    },
    verificationSummary: { ...row.verificationSummary },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<EsclFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    executionBaseline: row.executionBaseline,
    productionBaseline: row.productionBaseline,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    manifest: row.manifest,
    verificationSummary: row.verificationSummary,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EsclFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(review: LifecycleReview): EsclFreezeManifest {
  const state = getCustomerLifecycleState();
  const transition = getLifecycleTransition();
  const action = getLifecycleAction();

  return {
    productBaseline: ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1,
    executionBaseline: ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1,
    packBaseline: ESCL3_LIFECYCLE_ACTION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESCL_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESCL_FREEZE_VERSION,
      "ESCL-1": CUSTOMER_LIFECYCLE_STATE_VERSION,
      "ESCL-2": LIFECYCLE_TRANSITION_VERSION,
      "ESCL-3": LIFECYCLE_ACTION_VERSION,
      "ESCL-4": LIFECYCLE_REVIEW_VERSION,
    },
    componentFingerprints: {
      "ESCL-1": state.fingerprint,
      "ESCL-2": transition.fingerprint,
      "ESCL-3": action.fingerprint,
      "ESCL-4": review.fingerprint,
    },
  };
}

function deriveFromReview(review: LifecycleReview): EsclFreeze {
  const manifest = buildManifest(review);
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESCL_COMPONENTS.length === 4 &&
    ESCL_COMPONENTS.every((c) => c.status === "frozen") &&
    review.recordCount > 0 &&
    review.scope.noRuntimeSideEffects === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.executionBaseline === ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1 &&
    ESCE_V1_BASELINE === ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1;

  const withoutFp: Omit<EsclFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCL_FREEZE_ID,
    capability: ESCL_FREEZE_CAPABILITY,
    version: ESCL_FREEZE_VERSION,
    codename: ESCL_FREEZE_CODENAME,
    freezeDate: ESCL_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1,
    executionBaseline: ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESCL_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESCL-1~ESCL-4",
      closure: "ESCL-Freeze",
      product: "Enterprise SaaS Customer Lifecycle v1",
      immutable: true,
      freezeOnly: true,
      noEsceMutation: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      readOnly: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
      gaBaselineUnchanged: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildEsclFreeze(): EsclFreeze {
  const review = getLifecycleReview();
  const out = deriveFromReview(review);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEsclFreeze(): EsclFreeze {
  if (!cached) {
    return buildEsclFreeze();
  }
  return cloneFreeze(cached);
}

export function esclFreezeFingerprint(row?: EsclFreeze): string {
  const v = row ?? getEsclFreeze();
  return v.fingerprint;
}

export function clearEsclFreeze(): void {
  cached = null;
}

export function ensureReviewThenBuildEsclFreeze(): EsclFreeze {
  buildLifecycleReview();
  clearEsclFreeze();
  return buildEsclFreeze();
}
