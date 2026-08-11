/**
 * ESCA v1 Freeze — Enterprise SaaS Customer Advocacy Operations v1
 * Freezes ESCA-1..3: State → Readiness → Action Signal.
 * Product: enterprise-saas-customer-advocacy-operations-v1.
 * Freeze only — no frozen-layer mutation / persistence / runtime / CRM / marketing / contract / payment / billing execution.
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
  ESCA1_ADVOCACY_STATE_BASELINE,
  ESCA_2_ID,
  ADVOCACY_READINESS_CAPABILITY,
  ADVOCACY_READINESS_VERSION,
  getAdvocacyReadiness,
} from "./advocacy-readiness";
import {
  ESCA2_ADVOCACY_READINESS_BASELINE,
  ESCA_3_ID,
  ADVOCACY_ACTION_SIGNAL_CAPABILITY,
  ADVOCACY_ACTION_SIGNAL_VERSION,
  getAdvocacyActionSignal,
  type AdvocacyActionSignal,
} from "./advocacy-action-signal";
import {
  ADVOCACY_STATE_CAPABILITY,
  ADVOCACY_STATE_VERSION,
  ESCA_1_ID,
  ESRN_V1_BASELINE,
  getAdvocacyState,
} from "./advocacy-state";

export const ESCA_FREEZE_ID = "ESCA-Freeze" as const;
export const ESCA_FREEZE_CAPABILITY =
  "EscaCustomerAdvocacyOperationsFreeze" as const;
export const ESCA_FREEZE_VERSION = "esca-freeze-1.0.0" as const;
export const ESCA_FREEZE_CODENAME =
  "Enterprise SaaS Customer Advocacy Operations v1 Freeze" as const;
export const ESCA_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1 =
  "enterprise-saas-customer-advocacy-operations-v1" as const;

export type EscaComponentStatus = "frozen";

export type EscaComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EscaComponentStatus;
}>;

export const ESCA_COMPONENTS: readonly EscaComponentEntry[] = [
  {
    id: ESCA_1_ID,
    name: "Advocacy State",
    capability: ADVOCACY_STATE_CAPABILITY,
    version: ADVOCACY_STATE_VERSION,
    baselineTag: ESRN_V1_BASELINE,
    modulePath: "lib/commercial/advocacy/advocacy-state.ts",
    verifyScript: "scripts/verify-esca-1-advocacy-state.ts",
    buildApi: "buildAdvocacyState",
    status: "frozen",
  },
  {
    id: ESCA_2_ID,
    name: "Advocacy Readiness",
    capability: ADVOCACY_READINESS_CAPABILITY,
    version: ADVOCACY_READINESS_VERSION,
    baselineTag: ESCA1_ADVOCACY_STATE_BASELINE,
    modulePath: "lib/commercial/advocacy/advocacy-readiness.ts",
    verifyScript: "scripts/verify-esca-2-advocacy-readiness.ts",
    buildApi: "buildAdvocacyReadiness",
    status: "frozen",
  },
  {
    id: ESCA_3_ID,
    name: "Advocacy Action Signal",
    capability: ADVOCACY_ACTION_SIGNAL_CAPABILITY,
    version: ADVOCACY_ACTION_SIGNAL_VERSION,
    baselineTag: ESCA2_ADVOCACY_READINESS_BASELINE,
    modulePath: "lib/commercial/advocacy/advocacy-action-signal.ts",
    verifyScript: "scripts/verify-esca-3-advocacy-action-signal.ts",
    buildApi: "buildAdvocacyActionSignal",
    status: "frozen",
  },
] as const;

export type EscaFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1;
  renewalOperationsBaseline: typeof ESRN_V1_BASELINE;
  packBaseline: typeof ESCA2_ADVOCACY_READINESS_BASELINE;
  signalVersion: typeof ADVOCACY_ACTION_SIGNAL_VERSION;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EscaComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESCA_FREEZE_VERSION;
    "ESCA-1": typeof ADVOCACY_STATE_VERSION;
    "ESCA-2": typeof ADVOCACY_READINESS_VERSION;
    "ESCA-3": typeof ADVOCACY_ACTION_SIGNAL_VERSION;
  };
  componentFingerprints: {
    "ESCA-1": string;
    "ESCA-2": string;
    "ESCA-3": string;
  };
}>;

export type EscaFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCA_FREEZE_ID;
  capability: typeof ESCA_FREEZE_CAPABILITY;
  version: typeof ESCA_FREEZE_VERSION;
  codename: typeof ESCA_FREEZE_CODENAME;
  freezeDate: typeof ESCA_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1;
  renewalOperationsBaseline: typeof ESRN_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EscaFreezeManifest;
  signalFingerprint: string;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESCA-1~ESCA-3";
    closure: "ESCA-Freeze";
    chain: "STATE -> READINESS -> ACTION_SIGNAL -> FROZEN";
    product: "Enterprise SaaS Customer Advocacy Operations v1";
    immutable: true;
    freezeOnly: true;
    noEsrnMutation: true;
    noEsxpMutation: true;
    noEscrMutation: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
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

let cached: EscaFreeze | null = null;

function cloneFreeze(row: EscaFreeze): EscaFreeze {
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

function stablePayload(row: Omit<EscaFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    renewalOperationsBaseline: row.renewalOperationsBaseline,
    productionBaseline: row.productionBaseline,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    manifest: row.manifest,
    signalFingerprint: row.signalFingerprint,
    verificationSummary: row.verificationSummary,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EscaFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(): EscaFreezeManifest {
  const state = getAdvocacyState();
  const readiness = getAdvocacyReadiness();
  const signal = getAdvocacyActionSignal();
  return {
    productBaseline: ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1,
    renewalOperationsBaseline: ESRN_V1_BASELINE,
    packBaseline: ESCA2_ADVOCACY_READINESS_BASELINE,
    signalVersion: ADVOCACY_ACTION_SIGNAL_VERSION,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESCA_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESCA_FREEZE_VERSION,
      "ESCA-1": ADVOCACY_STATE_VERSION,
      "ESCA-2": ADVOCACY_READINESS_VERSION,
      "ESCA-3": ADVOCACY_ACTION_SIGNAL_VERSION,
    },
    componentFingerprints: {
      "ESCA-1": state.fingerprint,
      "ESCA-2": readiness.fingerprint,
      "ESCA-3": signal.fingerprint,
    },
  };
}

function deriveFromSignal(signal: AdvocacyActionSignal): EscaFreeze {
  const manifest = buildManifest();
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESCA_COMPONENTS.length === 3 &&
    ESCA_COMPONENTS.every((c) => c.status === "frozen") &&
    signal.recordCount > 0 &&
    signal.parentVersion === ADVOCACY_READINESS_VERSION &&
    signal.version === ADVOCACY_ACTION_SIGNAL_VERSION &&
    signal.scope.noRuntimeSideEffects === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.signalVersion === "esca-3-advocacy-action-signal-1" &&
    manifest.productBaseline ===
      ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1 &&
    manifest.renewalOperationsBaseline === ESRN_V1_BASELINE;

  const withoutFp: Omit<EscaFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCA_FREEZE_ID,
    capability: ESCA_FREEZE_CAPABILITY,
    version: ESCA_FREEZE_VERSION,
    codename: ESCA_FREEZE_CODENAME,
    freezeDate: ESCA_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1,
    renewalOperationsBaseline: ESRN_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    signalFingerprint: signal.fingerprint,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESCA_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESCA-1~ESCA-3",
      closure: "ESCA-Freeze",
      chain: "STATE -> READINESS -> ACTION_SIGNAL -> FROZEN",
      product: "Enterprise SaaS Customer Advocacy Operations v1",
      immutable: true,
      freezeOnly: true,
      noEsrnMutation: true,
      noEsxpMutation: true,
      noEscrMutation: true,
      noEscsMutation: true,
      noEsclMutation: true,
      noEsceMutation: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
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

export function buildEscaFreeze(): EscaFreeze {
  const signal = getAdvocacyActionSignal();
  const out = deriveFromSignal(signal);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEscaFreeze(): EscaFreeze {
  if (!cached) {
    return buildEscaFreeze();
  }
  return cloneFreeze(cached);
}

export function escaFreezeFingerprint(row?: EscaFreeze): string {
  return (row ?? getEscaFreeze()).fingerprint;
}

export function clearEscaFreeze(): void {
  cached = null;
}

export function ensureSignalThenBuildEscaFreeze(): EscaFreeze {
  getAdvocacyActionSignal();
  clearEscaFreeze();
  return buildEscaFreeze();
}
