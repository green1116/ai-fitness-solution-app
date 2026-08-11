/**
 * ESXP-6 — Expansion Freeze
 * Freezes ESXP-1..5: State → Opportunity → Recommendation → Outcome → Feedback.
 * Base: esxp-5-expansion-feedback-1.
 * Freeze only — no frozen-layer mutation / persistence / runtime side effects.
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
import {
  ESXP3_EXPANSION_RECOMMENDATION_BASELINE,
  ESXP_4_ID,
  EXPANSION_OUTCOME_CAPABILITY,
  EXPANSION_OUTCOME_VERSION,
  getExpansionOutcome,
} from "./outcome";
import {
  ESXP4_EXPANSION_OUTCOME_BASELINE,
  ESXP_5_ID,
  EXPANSION_FEEDBACK_CAPABILITY,
  EXPANSION_FEEDBACK_VERSION,
  getExpansionFeedback,
  type ExpansionFeedback,
} from "./feedback";
import {
  ESXP1_EXPANSION_STATE_BASELINE,
  ESXP_2_ID,
  EXPANSION_OPPORTUNITY_CAPABILITY,
  EXPANSION_OPPORTUNITY_VERSION,
  getExpansionOpportunity,
} from "./opportunity";
import {
  ESXP2_EXPANSION_OPPORTUNITY_BASELINE,
  ESXP_3_ID,
  EXPANSION_RECOMMENDATION_CAPABILITY,
  EXPANSION_RECOMMENDATION_VERSION,
  getExpansionRecommendation,
} from "./recommendation";
import {
  ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1,
  ESCR_V1_BASELINE,
  ESXP_1_ID,
  EXPANSION_STATE_CAPABILITY,
  EXPANSION_STATE_VERSION,
  getExpansionState,
} from "./state";

export const ESXP_6_ID = "ESXP-6" as const;
export const ESXP_FREEZE_ID = "ESXP-Freeze" as const;
export const ESXP_FREEZE_CAPABILITY = "EsxpExpansionFreeze" as const;
export const ESXP_FREEZE_VERSION = "esxp-freeze-1.0.0" as const;
export const ESXP_FREEZE_CODENAME =
  "Enterprise SaaS Customer Expansion v1 Freeze" as const;
export const ESXP_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_CUSTOMER_EXPANSION_V1 =
  "enterprise-saas-customer-expansion-v1" as const;

export type EsxpComponentStatus = "frozen";

export type EsxpComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EsxpComponentStatus;
}>;

export const ESXP_COMPONENTS: readonly EsxpComponentEntry[] = [
  {
    id: ESXP_1_ID,
    name: "Expansion State",
    capability: EXPANSION_STATE_CAPABILITY,
    version: EXPANSION_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1,
    modulePath: "lib/commercial/expansion/state.ts",
    verifyScript: "scripts/verify-esxp-1-expansion-state.ts",
    buildApi: "buildExpansionState",
    status: "frozen",
  },
  {
    id: ESXP_2_ID,
    name: "Expansion Opportunity",
    capability: EXPANSION_OPPORTUNITY_CAPABILITY,
    version: EXPANSION_OPPORTUNITY_VERSION,
    baselineTag: ESXP1_EXPANSION_STATE_BASELINE,
    modulePath: "lib/commercial/expansion/opportunity.ts",
    verifyScript: "scripts/verify-esxp-2-expansion-opportunity.ts",
    buildApi: "buildExpansionOpportunity",
    status: "frozen",
  },
  {
    id: ESXP_3_ID,
    name: "Expansion Recommendation",
    capability: EXPANSION_RECOMMENDATION_CAPABILITY,
    version: EXPANSION_RECOMMENDATION_VERSION,
    baselineTag: ESXP2_EXPANSION_OPPORTUNITY_BASELINE,
    modulePath: "lib/commercial/expansion/recommendation.ts",
    verifyScript: "scripts/verify-esxp-3-expansion-recommendation.ts",
    buildApi: "buildExpansionRecommendation",
    status: "frozen",
  },
  {
    id: ESXP_4_ID,
    name: "Expansion Outcome",
    capability: EXPANSION_OUTCOME_CAPABILITY,
    version: EXPANSION_OUTCOME_VERSION,
    baselineTag: ESXP3_EXPANSION_RECOMMENDATION_BASELINE,
    modulePath: "lib/commercial/expansion/outcome.ts",
    verifyScript: "scripts/verify-esxp-4-expansion-outcome.ts",
    buildApi: "buildExpansionOutcome",
    status: "frozen",
  },
  {
    id: ESXP_5_ID,
    name: "Expansion Feedback",
    capability: EXPANSION_FEEDBACK_CAPABILITY,
    version: EXPANSION_FEEDBACK_VERSION,
    baselineTag: ESXP4_EXPANSION_OUTCOME_BASELINE,
    modulePath: "lib/commercial/expansion/feedback.ts",
    verifyScript: "scripts/verify-esxp-5-expansion-feedback.ts",
    buildApi: "buildExpansionFeedback",
    status: "frozen",
  },
] as const;

export type EsxpFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_EXPANSION_V1;
  retentionOperationsBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1;
  escrBaseline: typeof ESCR_V1_BASELINE;
  packBaseline: typeof ESXP4_EXPANSION_OUTCOME_BASELINE;
  feedbackVersion: typeof EXPANSION_FEEDBACK_VERSION;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EsxpComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESXP_FREEZE_VERSION;
    "ESXP-1": typeof EXPANSION_STATE_VERSION;
    "ESXP-2": typeof EXPANSION_OPPORTUNITY_VERSION;
    "ESXP-3": typeof EXPANSION_RECOMMENDATION_VERSION;
    "ESXP-4": typeof EXPANSION_OUTCOME_VERSION;
    "ESXP-5": typeof EXPANSION_FEEDBACK_VERSION;
  };
  componentFingerprints: {
    "ESXP-1": string;
    "ESXP-2": string;
    "ESXP-3": string;
    "ESXP-4": string;
    "ESXP-5": string;
  };
}>;

export type EsxpFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESXP_FREEZE_ID;
  packId: typeof ESXP_6_ID;
  capability: typeof ESXP_FREEZE_CAPABILITY;
  version: typeof ESXP_FREEZE_VERSION;
  codename: typeof ESXP_FREEZE_CODENAME;
  freezeDate: typeof ESXP_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_EXPANSION_V1;
  retentionOperationsBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1;
  escrBaseline: typeof ESCR_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EsxpFreezeManifest;
  feedbackFingerprint: string;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESXP-1~ESXP-5";
    closure: "ESXP-Freeze";
    chain: "STATE -> OPPORTUNITY -> RECOMMENDATION -> OUTCOME -> FEEDBACK -> FROZEN";
    product: "Enterprise SaaS Customer Expansion v1";
    immutable: true;
    freezeOnly: true;
    noEscrMutation: true;
    noEscsMutation: true;
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

let cached: EsxpFreeze | null = null;

function cloneFreeze(row: EsxpFreeze): EsxpFreeze {
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

function stablePayload(row: Omit<EsxpFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    packId: row.packId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    retentionOperationsBaseline: row.retentionOperationsBaseline,
    escrBaseline: row.escrBaseline,
    productionBaseline: row.productionBaseline,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    manifest: row.manifest,
    feedbackFingerprint: row.feedbackFingerprint,
    verificationSummary: row.verificationSummary,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EsxpFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(): EsxpFreezeManifest {
  const state = getExpansionState();
  const opportunity = getExpansionOpportunity();
  const recommendation = getExpansionRecommendation();
  const outcome = getExpansionOutcome();
  const feedback = getExpansionFeedback();
  return {
    productBaseline: ENTERPRISE_SAAS_CUSTOMER_EXPANSION_V1,
    retentionOperationsBaseline:
      ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1,
    escrBaseline: ESCR_V1_BASELINE,
    packBaseline: ESXP4_EXPANSION_OUTCOME_BASELINE,
    feedbackVersion: EXPANSION_FEEDBACK_VERSION,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESXP_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESXP_FREEZE_VERSION,
      "ESXP-1": EXPANSION_STATE_VERSION,
      "ESXP-2": EXPANSION_OPPORTUNITY_VERSION,
      "ESXP-3": EXPANSION_RECOMMENDATION_VERSION,
      "ESXP-4": EXPANSION_OUTCOME_VERSION,
      "ESXP-5": EXPANSION_FEEDBACK_VERSION,
    },
    componentFingerprints: {
      "ESXP-1": state.fingerprint,
      "ESXP-2": opportunity.fingerprint,
      "ESXP-3": recommendation.fingerprint,
      "ESXP-4": outcome.fingerprint,
      "ESXP-5": feedback.fingerprint,
    },
  };
}

function deriveFromFeedback(feedback: ExpansionFeedback): EsxpFreeze {
  const manifest = buildManifest();
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESXP_COMPONENTS.length === 5 &&
    ESXP_COMPONENTS.every((c) => c.status === "frozen") &&
    feedback.recordCount > 0 &&
    feedback.parentVersion === EXPANSION_OUTCOME_VERSION &&
    feedback.version === EXPANSION_FEEDBACK_VERSION &&
    feedback.scope.noRuntimeSideEffects === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.feedbackVersion === "esxp-5-expansion-feedback-1" &&
    manifest.retentionOperationsBaseline ===
      ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1;

  const withoutFp: Omit<EsxpFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESXP_FREEZE_ID,
    packId: ESXP_6_ID,
    capability: ESXP_FREEZE_CAPABILITY,
    version: ESXP_FREEZE_VERSION,
    codename: ESXP_FREEZE_CODENAME,
    freezeDate: ESXP_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_EXPANSION_V1,
    retentionOperationsBaseline:
      ENTERPRISE_SAAS_CUSTOMER_RETENTION_OPERATIONS_V1,
    escrBaseline: ESCR_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    feedbackFingerprint: feedback.fingerprint,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESXP_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESXP-1~ESXP-5",
      closure: "ESXP-Freeze",
      chain: "STATE -> OPPORTUNITY -> RECOMMENDATION -> OUTCOME -> FEEDBACK -> FROZEN",
      product: "Enterprise SaaS Customer Expansion v1",
      immutable: true,
      freezeOnly: true,
      noEscrMutation: true,
      noEscsMutation: true,
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

export function buildEsxpFreeze(): EsxpFreeze {
  const feedback = getExpansionFeedback();
  const out = deriveFromFeedback(feedback);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEsxpFreeze(): EsxpFreeze {
  if (!cached) {
    return buildEsxpFreeze();
  }
  return cloneFreeze(cached);
}

export function esxpFreezeFingerprint(row?: EsxpFreeze): string {
  return (row ?? getEsxpFreeze()).fingerprint;
}

export function clearEsxpFreeze(): void {
  cached = null;
}

export function ensureFeedbackThenBuildEsxpFreeze(): EsxpFreeze {
  getExpansionFeedback();
  clearEsxpFreeze();
  return buildEsxpFreeze();
}
