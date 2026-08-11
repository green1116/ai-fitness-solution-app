/**
 * ESCE v1 Freeze — Enterprise SaaS Commercial Execution v1
 * Freezes CommercialActionSignal → CommercialExecution → ExecutionOutcome → ExecutionFeedback.
 * Base: enterprise-saas-commercial-operations-v1.
 * Freeze only — no new runtime capability / ESCO mutation / redesign.
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
  COMMERCIAL_ACTION_SIGNAL_CAPABILITY,
  COMMERCIAL_ACTION_SIGNAL_VERSION,
  ESCO2_COMMERCIAL_HEALTH_BASELINE,
  ESCO_3_ID,
  ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1,
  getCommercialActionSignal,
} from "../operations";
import {
  COMMERCIAL_EXECUTION_CAPABILITY,
  COMMERCIAL_EXECUTION_VERSION,
  ESCE_1_ID,
  ESCO_V1_BASELINE,
  getCommercialExecution,
} from "./commercial-execution";
import {
  ESCE_3_ID,
  EXECUTION_FEEDBACK_CAPABILITY,
  EXECUTION_FEEDBACK_VERSION,
  ESCE2_EXECUTION_OUTCOME_BASELINE,
  buildExecutionFeedback,
  getExecutionFeedback,
  type ExecutionFeedback,
} from "./execution-feedback";
import {
  ESCE1_COMMERCIAL_EXECUTION_BASELINE,
  ESCE_2_ID,
  EXECUTION_OUTCOME_CAPABILITY,
  EXECUTION_OUTCOME_VERSION,
  getExecutionOutcome,
} from "./execution-outcome";

export const ESCE_FREEZE_ID = "ESCE-Freeze" as const;
export const ESCE_FREEZE_CAPABILITY = "EsceCommercialExecutionFreeze" as const;
export const ESCE_FREEZE_VERSION = "esce-freeze-1.0.0" as const;
export const ESCE_FREEZE_CODENAME =
  "Enterprise SaaS Commercial Execution v1 Freeze" as const;
export const ESCE_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1 =
  "enterprise-saas-commercial-execution-v1" as const;

export type EsceComponentStatus = "frozen";

export type EsceComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EsceComponentStatus;
}>;

export const ESCE_COMPONENTS: readonly EsceComponentEntry[] = [
  {
    id: ESCO_3_ID,
    name: "Commercial Action Signal",
    capability: COMMERCIAL_ACTION_SIGNAL_CAPABILITY,
    version: COMMERCIAL_ACTION_SIGNAL_VERSION,
    baselineTag: ESCO2_COMMERCIAL_HEALTH_BASELINE,
    modulePath: "lib/commercial/operations/commercial-action-signal.ts",
    verifyScript: "scripts/verify-esco-3-commercial-action-signal.ts",
    buildApi: "buildCommercialActionSignal",
    status: "frozen",
  },
  {
    id: ESCE_1_ID,
    name: "Commercial Execution Foundation",
    capability: COMMERCIAL_EXECUTION_CAPABILITY,
    version: COMMERCIAL_EXECUTION_VERSION,
    baselineTag: ESCO_V1_BASELINE,
    modulePath: "lib/commercial/execution/commercial-execution.ts",
    verifyScript: "scripts/verify-esce-1-commercial-execution.ts",
    buildApi: "buildCommercialExecution",
    status: "frozen",
  },
  {
    id: ESCE_2_ID,
    name: "Execution Outcome",
    capability: EXECUTION_OUTCOME_CAPABILITY,
    version: EXECUTION_OUTCOME_VERSION,
    baselineTag: ESCE1_COMMERCIAL_EXECUTION_BASELINE,
    modulePath: "lib/commercial/execution/execution-outcome.ts",
    verifyScript: "scripts/verify-esce-2-execution-outcome.ts",
    buildApi: "buildExecutionOutcome",
    status: "frozen",
  },
  {
    id: ESCE_3_ID,
    name: "Execution Feedback",
    capability: EXECUTION_FEEDBACK_CAPABILITY,
    version: EXECUTION_FEEDBACK_VERSION,
    baselineTag: ESCE2_EXECUTION_OUTCOME_BASELINE,
    modulePath: "lib/commercial/execution/execution-feedback.ts",
    verifyScript: "scripts/verify-esce-3-execution-feedback.ts",
    buildApi: "buildExecutionFeedback",
    status: "frozen",
  },
] as const;

export type EsceFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1;
  operationsBaseline: typeof ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1;
  packBaseline: typeof ESCE2_EXECUTION_OUTCOME_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EsceComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESCE_FREEZE_VERSION;
    "ESCO-3": typeof COMMERCIAL_ACTION_SIGNAL_VERSION;
    "ESCE-1": typeof COMMERCIAL_EXECUTION_VERSION;
    "ESCE-2": typeof EXECUTION_OUTCOME_VERSION;
    "ESCE-3": typeof EXECUTION_FEEDBACK_VERSION;
  };
  componentFingerprints: {
    "ESCO-3": string;
    "ESCE-1": string;
    "ESCE-2": string;
    "ESCE-3": string;
  };
}>;

export type EsceFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCE_FREEZE_ID;
  capability: typeof ESCE_FREEZE_CAPABILITY;
  version: typeof ESCE_FREEZE_VERSION;
  codename: typeof ESCE_FREEZE_CODENAME;
  freezeDate: typeof ESCE_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1;
  operationsBaseline: typeof ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EsceFreezeManifest;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESCO-3→ESCE-1~ESCE-3";
    closure: "ESCE-Freeze";
    product: "Enterprise SaaS Commercial Execution v1";
    immutable: true;
    freezeOnly: true;
    noNewRuntimeCapability: true;
    noEscoMutation: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: EsceFreeze | null = null;

function cloneFreeze(row: EsceFreeze): EsceFreeze {
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

function stablePayload(row: Omit<EsceFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    operationsBaseline: row.operationsBaseline,
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

function computeFingerprint(row: Omit<EsceFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(feedback: ExecutionFeedback): EsceFreezeManifest {
  const signal = getCommercialActionSignal();
  const execution = getCommercialExecution();
  const outcome = getExecutionOutcome();

  return {
    productBaseline: ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1,
    operationsBaseline: ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1,
    packBaseline: ESCE2_EXECUTION_OUTCOME_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESCE_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESCE_FREEZE_VERSION,
      "ESCO-3": COMMERCIAL_ACTION_SIGNAL_VERSION,
      "ESCE-1": COMMERCIAL_EXECUTION_VERSION,
      "ESCE-2": EXECUTION_OUTCOME_VERSION,
      "ESCE-3": EXECUTION_FEEDBACK_VERSION,
    },
    componentFingerprints: {
      "ESCO-3": signal.fingerprint,
      "ESCE-1": execution.fingerprint,
      "ESCE-2": outcome.fingerprint,
      "ESCE-3": feedback.fingerprint,
    },
  };
}

function deriveFromFeedback(feedback: ExecutionFeedback): EsceFreeze {
  const manifest = buildManifest(feedback);
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESCE_COMPONENTS.length === 4 &&
    ESCE_COMPONENTS.every((c) => c.status === "frozen") &&
    feedback.recordCount > 0 &&
    fps.every((fp) => fp.length === 64) &&
    manifest.operationsBaseline === ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1 &&
    ESCO_V1_BASELINE === ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1;

  const withoutFp: Omit<EsceFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCE_FREEZE_ID,
    capability: ESCE_FREEZE_CAPABILITY,
    version: ESCE_FREEZE_VERSION,
    codename: ESCE_FREEZE_CODENAME,
    freezeDate: ESCE_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1,
    operationsBaseline: ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESCE_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESCO-3→ESCE-1~ESCE-3",
      closure: "ESCE-Freeze",
      product: "Enterprise SaaS Commercial Execution v1",
      immutable: true,
      freezeOnly: true,
      noNewRuntimeCapability: true,
      noEscoMutation: true,
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

export function buildEsceFreeze(): EsceFreeze {
  const feedback = getExecutionFeedback();
  const out = deriveFromFeedback(feedback);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEsceFreeze(): EsceFreeze {
  if (!cached) {
    return buildEsceFreeze();
  }
  return cloneFreeze(cached);
}

export function esceFreezeFingerprint(row?: EsceFreeze): string {
  const v = row ?? getEsceFreeze();
  return v.fingerprint;
}

export function clearEsceFreeze(): void {
  cached = null;
}

export function ensureFeedbackThenBuildEsceFreeze(): EsceFreeze {
  buildExecutionFeedback();
  clearEsceFreeze();
  return buildEsceFreeze();
}
