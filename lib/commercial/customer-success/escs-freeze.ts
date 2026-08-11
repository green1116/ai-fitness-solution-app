/**
 * ESCS v1 Freeze — Enterprise SaaS Customer Success v1
 * Freezes State → Intervention → Outcome → Review.
 * Base: enterprise-saas-customer-lifecycle-operations-v1.
 * Freeze only — no ESCL / ESCE mutation / persistence / runtime side effects.
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
import { ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1 } from "../lifecycle";
import {
  CUSTOMER_SUCCESS_INTERVENTION_CAPABILITY,
  CUSTOMER_SUCCESS_INTERVENTION_VERSION,
  ESCS1_CUSTOMER_SUCCESS_STATE_BASELINE,
  ESCS_2_ID,
  getCustomerSuccessIntervention,
} from "./customer-success-intervention";
import {
  CUSTOMER_SUCCESS_OUTCOME_CAPABILITY,
  CUSTOMER_SUCCESS_OUTCOME_VERSION,
  ESCS2_CUSTOMER_SUCCESS_INTERVENTION_BASELINE,
  ESCS_3_ID,
  getCustomerSuccessOutcome,
} from "./customer-success-outcome";
import {
  CUSTOMER_SUCCESS_REVIEW_CAPABILITY,
  CUSTOMER_SUCCESS_REVIEW_VERSION,
  ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE,
  ESCS_4_ID,
  buildCustomerSuccessReview,
  getCustomerSuccessReview,
  type CustomerSuccessReview,
} from "./customer-success-review";
import {
  CUSTOMER_SUCCESS_STATE_CAPABILITY,
  CUSTOMER_SUCCESS_STATE_VERSION,
  ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
  ESCL_V1_BASELINE,
  ESCS_1_ID,
  getCustomerSuccessState,
} from "./customer-success-state";

export const ESCS_FREEZE_ID = "ESCS-Freeze" as const;
export const ESCS_FREEZE_CAPABILITY = "EscsCustomerSuccessFreeze" as const;
export const ESCS_FREEZE_VERSION = "escs-freeze-1.0.0" as const;
export const ESCS_FREEZE_CODENAME =
  "Enterprise SaaS Customer Success v1 Freeze" as const;
export const ESCS_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1 =
  "enterprise-saas-customer-success-v1" as const;

export type EscsComponentStatus = "frozen";

export type EscsComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EscsComponentStatus;
}>;

export const ESCS_COMPONENTS: readonly EscsComponentEntry[] = [
  {
    id: ESCS_1_ID,
    name: "Customer Success State",
    capability: CUSTOMER_SUCCESS_STATE_CAPABILITY,
    version: CUSTOMER_SUCCESS_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
    modulePath: "lib/commercial/customer-success/customer-success-state.ts",
    verifyScript: "scripts/verify-escs-1-customer-success-state.ts",
    buildApi: "buildCustomerSuccessState",
    status: "frozen",
  },
  {
    id: ESCS_2_ID,
    name: "Customer Success Intervention",
    capability: CUSTOMER_SUCCESS_INTERVENTION_CAPABILITY,
    version: CUSTOMER_SUCCESS_INTERVENTION_VERSION,
    baselineTag: ESCS1_CUSTOMER_SUCCESS_STATE_BASELINE,
    modulePath:
      "lib/commercial/customer-success/customer-success-intervention.ts",
    verifyScript: "scripts/verify-escs-2-customer-success-intervention.ts",
    buildApi: "buildCustomerSuccessIntervention",
    status: "frozen",
  },
  {
    id: ESCS_3_ID,
    name: "Customer Success Outcome",
    capability: CUSTOMER_SUCCESS_OUTCOME_CAPABILITY,
    version: CUSTOMER_SUCCESS_OUTCOME_VERSION,
    baselineTag: ESCS2_CUSTOMER_SUCCESS_INTERVENTION_BASELINE,
    modulePath: "lib/commercial/customer-success/customer-success-outcome.ts",
    verifyScript: "scripts/verify-escs-3-customer-success-outcome.ts",
    buildApi: "buildCustomerSuccessOutcome",
    status: "frozen",
  },
  {
    id: ESCS_4_ID,
    name: "Customer Success Review",
    capability: CUSTOMER_SUCCESS_REVIEW_CAPABILITY,
    version: CUSTOMER_SUCCESS_REVIEW_VERSION,
    baselineTag: ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE,
    modulePath: "lib/commercial/customer-success/customer-success-review.ts",
    verifyScript: "scripts/verify-escs-4-success-review-freeze.ts",
    buildApi: "buildCustomerSuccessReview",
    status: "frozen",
  },
] as const;

export type EscsFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1;
  operationsBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1;
  esclBaseline: typeof ESCL_V1_BASELINE;
  packBaseline: typeof ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EscsComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESCS_FREEZE_VERSION;
    "ESCS-1": typeof CUSTOMER_SUCCESS_STATE_VERSION;
    "ESCS-2": typeof CUSTOMER_SUCCESS_INTERVENTION_VERSION;
    "ESCS-3": typeof CUSTOMER_SUCCESS_OUTCOME_VERSION;
    "ESCS-4": typeof CUSTOMER_SUCCESS_REVIEW_VERSION;
  };
  componentFingerprints: {
    "ESCS-1": string;
    "ESCS-2": string;
    "ESCS-3": string;
    "ESCS-4": string;
  };
}>;

export type EscsFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCS_FREEZE_ID;
  capability: typeof ESCS_FREEZE_CAPABILITY;
  version: typeof ESCS_FREEZE_VERSION;
  codename: typeof ESCS_FREEZE_CODENAME;
  freezeDate: typeof ESCS_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1;
  operationsBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1;
  esclBaseline: typeof ESCL_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EscsFreezeManifest;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESCS-1~ESCS-4";
    closure: "ESCS-Freeze";
    chain: "STATE -> INTERVENTION -> OUTCOME -> REVIEW -> FROZEN";
    product: "Enterprise SaaS Customer Success v1";
    immutable: true;
    freezeOnly: true;
    noEsclMutation: true;
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

let cached: EscsFreeze | null = null;

function cloneFreeze(row: EscsFreeze): EscsFreeze {
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

function stablePayload(row: Omit<EscsFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    operationsBaseline: row.operationsBaseline,
    esclBaseline: row.esclBaseline,
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

function computeFingerprint(row: Omit<EscsFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(review: CustomerSuccessReview): EscsFreezeManifest {
  const state = getCustomerSuccessState();
  const intervention = getCustomerSuccessIntervention();
  const outcome = getCustomerSuccessOutcome();

  return {
    productBaseline: ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1,
    operationsBaseline: ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
    esclBaseline: ESCL_V1_BASELINE,
    packBaseline: ESCS3_CUSTOMER_SUCCESS_OUTCOME_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESCS_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESCS_FREEZE_VERSION,
      "ESCS-1": CUSTOMER_SUCCESS_STATE_VERSION,
      "ESCS-2": CUSTOMER_SUCCESS_INTERVENTION_VERSION,
      "ESCS-3": CUSTOMER_SUCCESS_OUTCOME_VERSION,
      "ESCS-4": CUSTOMER_SUCCESS_REVIEW_VERSION,
    },
    componentFingerprints: {
      "ESCS-1": state.fingerprint,
      "ESCS-2": intervention.fingerprint,
      "ESCS-3": outcome.fingerprint,
      "ESCS-4": review.fingerprint,
    },
  };
}

function deriveFromReview(review: CustomerSuccessReview): EscsFreeze {
  const manifest = buildManifest(review);
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESCS_COMPONENTS.length === 4 &&
    ESCS_COMPONENTS.every((c) => c.status === "frozen") &&
    review.recordCount > 0 &&
    review.lifecycleComplete === true &&
    review.freezeReady === true &&
    review.scope.noRuntimeSideEffects === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.operationsBaseline ===
      ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1 &&
    ESCL_V1_BASELINE === ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1;

  const withoutFp: Omit<EscsFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCS_FREEZE_ID,
    capability: ESCS_FREEZE_CAPABILITY,
    version: ESCS_FREEZE_VERSION,
    codename: ESCS_FREEZE_CODENAME,
    freezeDate: ESCS_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1,
    operationsBaseline: ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_OPERATIONS_V1,
    esclBaseline: ESCL_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESCS_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESCS-1~ESCS-4",
      closure: "ESCS-Freeze",
      chain: "STATE -> INTERVENTION -> OUTCOME -> REVIEW -> FROZEN",
      product: "Enterprise SaaS Customer Success v1",
      immutable: true,
      freezeOnly: true,
      noEsclMutation: true,
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

export function buildEscsFreeze(): EscsFreeze {
  const review = getCustomerSuccessReview();
  const out = deriveFromReview(review);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEscsFreeze(): EscsFreeze {
  if (!cached) {
    return buildEscsFreeze();
  }
  return cloneFreeze(cached);
}

export function escsFreezeFingerprint(row?: EscsFreeze): string {
  const v = row ?? getEscsFreeze();
  return v.fingerprint;
}

export function clearEscsFreeze(): void {
  cached = null;
}

export function ensureReviewThenBuildEscsFreeze(): EscsFreeze {
  buildCustomerSuccessReview();
  clearEscsFreeze();
  return buildEscsFreeze();
}
