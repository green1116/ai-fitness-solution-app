/**
 * ESCO v1 Freeze — Enterprise SaaS Commercial Operations v1
 * Freezes ESCO-1..ESCO-4. Base: enterprise-saas-runtime-operations-v1.
 * Freeze only — no runtime/action execution / CRM / billing / redesign.
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
import { ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1 } from "../../runtime/freeze";
import {
  COMMERCIAL_ACTION_SIGNAL_CAPABILITY,
  COMMERCIAL_ACTION_SIGNAL_VERSION,
  ESCO2_COMMERCIAL_HEALTH_BASELINE,
  ESCO_3_ID,
  buildCommercialActionSignal,
  getCommercialActionSignal,
} from "./commercial-action-signal";
import {
  COMMERCIAL_HEALTH_CAPABILITY,
  COMMERCIAL_HEALTH_VERSION,
  ESCO1_COMMERCIAL_OPERATIONS_BASELINE,
  ESCO_2_ID,
  getCommercialHealth,
} from "./commercial-health";
import {
  COMMERCIAL_OPERATIONS_CAPABILITY,
  COMMERCIAL_OPERATIONS_VERSION,
  ESCO_1_ID,
  ESRO_V1_BASELINE,
  getCommercialOperations,
} from "./commercial-operations";
import {
  COMMERCIAL_OPERATIONS_REVIEW_CAPABILITY,
  COMMERCIAL_OPERATIONS_REVIEW_VERSION,
  ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE,
  ESCO_4_ID,
  buildCommercialOperationsReview,
  getCommercialOperationsReview,
  type CommercialOperationsReview,
} from "./commercial-review";

export const ESCO_FREEZE_ID = "ESCO-Freeze" as const;
export const ESCO_FREEZE_CAPABILITY = "EscoCommercialOperationsFreeze" as const;
export const ESCO_FREEZE_VERSION = "esco-freeze-1.0.0" as const;
export const ESCO_FREEZE_CODENAME =
  "Enterprise SaaS Commercial Operations v1 Freeze" as const;
export const ESCO_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1 =
  "enterprise-saas-commercial-operations-v1" as const;

export type EscoComponentStatus = "frozen";

export type EscoComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EscoComponentStatus;
}>;

export const ESCO_COMPONENTS: readonly EscoComponentEntry[] = [
  {
    id: ESCO_1_ID,
    name: "Commercial Operations Foundation",
    capability: COMMERCIAL_OPERATIONS_CAPABILITY,
    version: COMMERCIAL_OPERATIONS_VERSION,
    baselineTag: ESRO_V1_BASELINE,
    modulePath: "lib/commercial/operations/commercial-operations.ts",
    verifyScript: "scripts/verify-esco-1-commercial-operations.ts",
    buildApi: "buildCommercialOperations",
    status: "frozen",
  },
  {
    id: ESCO_2_ID,
    name: "Commercial Health Foundation",
    capability: COMMERCIAL_HEALTH_CAPABILITY,
    version: COMMERCIAL_HEALTH_VERSION,
    baselineTag: ESCO1_COMMERCIAL_OPERATIONS_BASELINE,
    modulePath: "lib/commercial/operations/commercial-health.ts",
    verifyScript: "scripts/verify-esco-2-commercial-health.ts",
    buildApi: "buildCommercialHealth",
    status: "frozen",
  },
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
    id: ESCO_4_ID,
    name: "Commercial Operations Review",
    capability: COMMERCIAL_OPERATIONS_REVIEW_CAPABILITY,
    version: COMMERCIAL_OPERATIONS_REVIEW_VERSION,
    baselineTag: ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE,
    modulePath: "lib/commercial/operations/commercial-review.ts",
    verifyScript: "scripts/verify-esco-4-commercial-review.ts",
    buildApi: "buildCommercialOperationsReview",
    status: "frozen",
  },
] as const;

export type EscoFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1;
  runtimeBaseline: typeof ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;
  packBaseline: typeof ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EscoComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESCO_FREEZE_VERSION;
    "ESCO-1": typeof COMMERCIAL_OPERATIONS_VERSION;
    "ESCO-2": typeof COMMERCIAL_HEALTH_VERSION;
    "ESCO-3": typeof COMMERCIAL_ACTION_SIGNAL_VERSION;
    "ESCO-4": typeof COMMERCIAL_OPERATIONS_REVIEW_VERSION;
  };
  componentFingerprints: {
    "ESCO-1": string;
    "ESCO-2": string;
    "ESCO-3": string;
    "ESCO-4": string;
  };
}>;

export type EscoFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCO_FREEZE_ID;
  capability: typeof ESCO_FREEZE_CAPABILITY;
  version: typeof ESCO_FREEZE_VERSION;
  codename: typeof ESCO_FREEZE_CODENAME;
  freezeDate: typeof ESCO_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1;
  runtimeBaseline: typeof ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EscoFreezeManifest;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESCO-1~ESCO-4";
    closure: "ESCO-Freeze";
    product: "Enterprise SaaS Commercial Operations v1";
    immutable: true;
    freezeOnly: true;
    noRuntimeExecution: true;
    noActionExecution: true;
    readOnly: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: EscoFreeze | null = null;

function cloneFreeze(row: EscoFreeze): EscoFreeze {
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

function stablePayload(row: Omit<EscoFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    runtimeBaseline: row.runtimeBaseline,
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

function computeFingerprint(row: Omit<EscoFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(
  review: CommercialOperationsReview,
): EscoFreezeManifest {
  const operations = getCommercialOperations();
  const health = getCommercialHealth();
  const signal = getCommercialActionSignal();

  return {
    productBaseline: ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1,
    runtimeBaseline: ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    packBaseline: ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESCO_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESCO_FREEZE_VERSION,
      "ESCO-1": COMMERCIAL_OPERATIONS_VERSION,
      "ESCO-2": COMMERCIAL_HEALTH_VERSION,
      "ESCO-3": COMMERCIAL_ACTION_SIGNAL_VERSION,
      "ESCO-4": COMMERCIAL_OPERATIONS_REVIEW_VERSION,
    },
    componentFingerprints: {
      "ESCO-1": operations.fingerprint,
      "ESCO-2": health.fingerprint,
      "ESCO-3": signal.fingerprint,
      "ESCO-4": review.fingerprint,
    },
  };
}

function deriveFromReview(review: CommercialOperationsReview): EscoFreeze {
  const manifest = buildManifest(review);
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESCO_COMPONENTS.length === 4 &&
    ESCO_COMPONENTS.every((c) => c.status === "frozen") &&
    review.recordCount > 0 &&
    review.scope.noExecution === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.runtimeBaseline === ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1 &&
    ESRO_V1_BASELINE === ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;

  const withoutFp: Omit<EscoFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCO_FREEZE_ID,
    capability: ESCO_FREEZE_CAPABILITY,
    version: ESCO_FREEZE_VERSION,
    codename: ESCO_FREEZE_CODENAME,
    freezeDate: ESCO_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_COMMERCIAL_OPERATIONS_V1,
    runtimeBaseline: ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESCO_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESCO-1~ESCO-4",
      closure: "ESCO-Freeze",
      product: "Enterprise SaaS Commercial Operations v1",
      immutable: true,
      freezeOnly: true,
      noRuntimeExecution: true,
      noActionExecution: true,
      readOnly: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
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

/** Build immutable ESCO v1 freeze from ESCO-4 review. */
export function buildEscoFreeze(): EscoFreeze {
  const review = getCommercialOperationsReview();
  const out = deriveFromReview(review);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEscoFreeze(): EscoFreeze {
  if (!cached) {
    return buildEscoFreeze();
  }
  return cloneFreeze(cached);
}

export function escoFreezeFingerprint(row?: EscoFreeze): string {
  const v = row ?? getEscoFreeze();
  return v.fingerprint;
}

export function clearEscoFreeze(): void {
  cached = null;
}

export function ensureReviewThenBuildEscoFreeze(): EscoFreeze {
  buildCommercialActionSignal();
  buildCommercialOperationsReview();
  clearEscoFreeze();
  return buildEscoFreeze();
}
