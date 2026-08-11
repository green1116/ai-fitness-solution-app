/**
 * ESPO v1 Freeze — Enterprise SaaS Production Operations v1
 * Freezes ESPO-1..4: Queue → Decision → Outcome → Feedback.
 * Product: enterprise-saas-production-operations-v1.
 * Freeze only — no frozen-layer mutation / persistence / execution / orchestration / CRM / billing.
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
  ESPO1_OPERATING_QUEUE_BASELINE,
  ESPO_2_ID,
  OPERATING_DECISION_CAPABILITY,
  OPERATING_DECISION_VERSION,
  getOperatingDecision,
} from "./operating-decision";
import {
  ESPO3_OPERATING_OUTCOME_BASELINE,
  ESPO_4_ID,
  OPERATING_FEEDBACK_CAPABILITY,
  OPERATING_FEEDBACK_VERSION,
  getOperatingFeedback,
  type OperatingFeedback,
} from "./operating-feedback";
import {
  ESPO2_OPERATING_DECISION_BASELINE,
  ESPO_3_ID,
  OPERATING_OUTCOME_CAPABILITY,
  OPERATING_OUTCOME_VERSION,
  getOperatingOutcome,
} from "./operating-outcome";
import {
  ESCP_V1_BASELINE,
  ESPO_1_ID,
  OPERATING_QUEUE_CAPABILITY,
  OPERATING_QUEUE_VERSION,
  getOperatingQueue,
} from "./operating-queue";

export const ESPO_FREEZE_ID = "ESPO-Freeze" as const;
export const ESPO_FREEZE_CAPABILITY =
  "EspoProductionOperationsFreeze" as const;
export const ESPO_FREEZE_VERSION = "espo-freeze-1.0.0" as const;
export const ESPO_FREEZE_CODENAME =
  "Enterprise SaaS Production Operations v1 Freeze" as const;
export const ESPO_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1 =
  "enterprise-saas-production-operations-v1" as const;

export type EspoComponentStatus = "frozen";

export type EspoComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EspoComponentStatus;
}>;

export const ESPO_COMPONENTS: readonly EspoComponentEntry[] = [
  {
    id: ESPO_1_ID,
    name: "Commercial Operating Queue",
    capability: OPERATING_QUEUE_CAPABILITY,
    version: OPERATING_QUEUE_VERSION,
    baselineTag: ESCP_V1_BASELINE,
    modulePath: "lib/commercial/production-ops/operating-queue.ts",
    verifyScript: "scripts/verify-espo-1-operating-queue.ts",
    buildApi: "buildOperatingQueue",
    status: "frozen",
  },
  {
    id: ESPO_2_ID,
    name: "Operating Decision",
    capability: OPERATING_DECISION_CAPABILITY,
    version: OPERATING_DECISION_VERSION,
    baselineTag: ESPO1_OPERATING_QUEUE_BASELINE,
    modulePath: "lib/commercial/production-ops/operating-decision.ts",
    verifyScript: "scripts/verify-espo-2-operating-decision.ts",
    buildApi: "buildOperatingDecision",
    status: "frozen",
  },
  {
    id: ESPO_3_ID,
    name: "Operating Outcome",
    capability: OPERATING_OUTCOME_CAPABILITY,
    version: OPERATING_OUTCOME_VERSION,
    baselineTag: ESPO2_OPERATING_DECISION_BASELINE,
    modulePath: "lib/commercial/production-ops/operating-outcome.ts",
    verifyScript: "scripts/verify-espo-3-operating-outcome.ts",
    buildApi: "buildOperatingOutcome",
    status: "frozen",
  },
  {
    id: ESPO_4_ID,
    name: "Operating Feedback",
    capability: OPERATING_FEEDBACK_CAPABILITY,
    version: OPERATING_FEEDBACK_VERSION,
    baselineTag: ESPO3_OPERATING_OUTCOME_BASELINE,
    modulePath: "lib/commercial/production-ops/operating-feedback.ts",
    verifyScript: "scripts/verify-espo-4-operating-feedback.ts",
    buildApi: "buildOperatingFeedback",
    status: "frozen",
  },
] as const;

export type EspoFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1;
  planningOperationsBaseline: typeof ESCP_V1_BASELINE;
  packBaseline: typeof ESPO3_OPERATING_OUTCOME_BASELINE;
  feedbackVersion: typeof OPERATING_FEEDBACK_VERSION;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EspoComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESPO_FREEZE_VERSION;
    "ESPO-1": typeof OPERATING_QUEUE_VERSION;
    "ESPO-2": typeof OPERATING_DECISION_VERSION;
    "ESPO-3": typeof OPERATING_OUTCOME_VERSION;
    "ESPO-4": typeof OPERATING_FEEDBACK_VERSION;
  };
  componentFingerprints: {
    "ESPO-1": string;
    "ESPO-2": string;
    "ESPO-3": string;
    "ESPO-4": string;
  };
}>;

export type EspoFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESPO_FREEZE_ID;
  capability: typeof ESPO_FREEZE_CAPABILITY;
  version: typeof ESPO_FREEZE_VERSION;
  codename: typeof ESPO_FREEZE_CODENAME;
  freezeDate: typeof ESPO_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1;
  planningOperationsBaseline: typeof ESCP_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EspoFreezeManifest;
  feedbackFingerprint: string;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESPO-1~ESPO-4";
    closure: "ESPO-Freeze";
    chain: "QUEUE -> DECISION -> OUTCOME -> FEEDBACK -> FROZEN";
    product: "Enterprise SaaS Production Operations v1";
    immutable: true;
    freezeOnly: true;
    noEscpMutation: true;
    noEsciMutation: true;
    noEscaMutation: true;
    noEsrnMutation: true;
    noEsxpMutation: true;
    noEscrMutation: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noExecution: true;
    noMarketingExecution: true;
    noContractExecution: true;
    noPaymentExecution: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: EspoFreeze | null = null;

function cloneFreeze(row: EspoFreeze): EspoFreeze {
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

function stablePayload(row: Omit<EspoFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    planningOperationsBaseline: row.planningOperationsBaseline,
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

function computeFingerprint(row: Omit<EspoFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(): EspoFreezeManifest {
  const queue = getOperatingQueue();
  const decision = getOperatingDecision();
  const outcome = getOperatingOutcome();
  const feedback = getOperatingFeedback();
  return {
    productBaseline: ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1,
    planningOperationsBaseline: ESCP_V1_BASELINE,
    packBaseline: ESPO3_OPERATING_OUTCOME_BASELINE,
    feedbackVersion: OPERATING_FEEDBACK_VERSION,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESPO_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESPO_FREEZE_VERSION,
      "ESPO-1": OPERATING_QUEUE_VERSION,
      "ESPO-2": OPERATING_DECISION_VERSION,
      "ESPO-3": OPERATING_OUTCOME_VERSION,
      "ESPO-4": OPERATING_FEEDBACK_VERSION,
    },
    componentFingerprints: {
      "ESPO-1": queue.fingerprint,
      "ESPO-2": decision.fingerprint,
      "ESPO-3": outcome.fingerprint,
      "ESPO-4": feedback.fingerprint,
    },
  };
}

function deriveFromFeedback(feedback: OperatingFeedback): EspoFreeze {
  const manifest = buildManifest();
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESPO_COMPONENTS.length === 4 &&
    ESPO_COMPONENTS.every((c) => c.status === "frozen") &&
    feedback.recordCount > 0 &&
    feedback.parentVersion === OPERATING_OUTCOME_VERSION &&
    feedback.version === OPERATING_FEEDBACK_VERSION &&
    feedback.scope.noRuntimeSideEffects === true &&
    feedback.scope.noExecution === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.feedbackVersion === "espo-4-operating-feedback-1" &&
    manifest.productBaseline === ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1 &&
    manifest.planningOperationsBaseline === ESCP_V1_BASELINE;

  const withoutFp: Omit<EspoFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESPO_FREEZE_ID,
    capability: ESPO_FREEZE_CAPABILITY,
    version: ESPO_FREEZE_VERSION,
    codename: ESPO_FREEZE_CODENAME,
    freezeDate: ESPO_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1,
    planningOperationsBaseline: ESCP_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    feedbackFingerprint: feedback.fingerprint,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESPO_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESPO-1~ESPO-4",
      closure: "ESPO-Freeze",
      chain: "QUEUE -> DECISION -> OUTCOME -> FEEDBACK -> FROZEN",
      product: "Enterprise SaaS Production Operations v1",
      immutable: true,
      freezeOnly: true,
      noEscpMutation: true,
      noEsciMutation: true,
      noEscaMutation: true,
      noEsrnMutation: true,
      noEsxpMutation: true,
      noEscrMutation: true,
      noEscsMutation: true,
      noEsclMutation: true,
      noEsceMutation: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noExecution: true,
      noMarketingExecution: true,
      noContractExecution: true,
      noPaymentExecution: true,
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

export function buildEspoFreeze(): EspoFreeze {
  const feedback = getOperatingFeedback();
  const out = deriveFromFeedback(feedback);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEspoFreeze(): EspoFreeze {
  if (!cached) {
    return buildEspoFreeze();
  }
  return cloneFreeze(cached);
}

export function espoFreezeFingerprint(row?: EspoFreeze): string {
  return (row ?? getEspoFreeze()).fingerprint;
}

export function clearEspoFreeze(): void {
  cached = null;
}

export function ensureFeedbackThenBuildEspoFreeze(): EspoFreeze {
  getOperatingFeedback();
  clearEspoFreeze();
  return buildEspoFreeze();
}
