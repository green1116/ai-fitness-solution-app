/**
 * ESRN v1 Freeze — Enterprise SaaS Renewal Operations v1
 * Freezes ESRN-1..3: State → Readiness → Action Signal.
 * Product: enterprise-saas-renewal-operations-v1.
 * Freeze only — no frozen-layer mutation / persistence / runtime / CRM / billing / contract / payment execution.
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
  ESRN1_RENEWAL_STATE_BASELINE,
  ESRN_2_ID,
  RENEWAL_READINESS_CAPABILITY,
  RENEWAL_READINESS_VERSION,
  getRenewalReadiness,
} from "./renewal-readiness";
import {
  ESRN2_RENEWAL_READINESS_BASELINE,
  ESRN_3_ID,
  RENEWAL_ACTION_SIGNAL_CAPABILITY,
  RENEWAL_ACTION_SIGNAL_VERSION,
  getRenewalActionSignal,
  type RenewalActionSignal,
} from "./renewal-action-signal";
import {
  ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1,
  ESRN_1_ID,
  ESXP_V1_BASELINE,
  RENEWAL_STATE_CAPABILITY,
  RENEWAL_STATE_VERSION,
  getRenewalState,
} from "./renewal-state";

export const ESRN_FREEZE_ID = "ESRN-Freeze" as const;
export const ESRN_FREEZE_CAPABILITY = "EsrnRenewalOperationsFreeze" as const;
export const ESRN_FREEZE_VERSION = "esrn-freeze-1.0.0" as const;
export const ESRN_FREEZE_CODENAME =
  "Enterprise SaaS Renewal Operations v1 Freeze" as const;
export const ESRN_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1 =
  "enterprise-saas-renewal-operations-v1" as const;

export type EsrnComponentStatus = "frozen";

export type EsrnComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EsrnComponentStatus;
}>;

export const ESRN_COMPONENTS: readonly EsrnComponentEntry[] = [
  {
    id: ESRN_1_ID,
    name: "Renewal State",
    capability: RENEWAL_STATE_CAPABILITY,
    version: RENEWAL_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1,
    modulePath: "lib/commercial/renewal/renewal-state.ts",
    verifyScript: "scripts/verify-esrn-1-renewal-state.ts",
    buildApi: "buildRenewalState",
    status: "frozen",
  },
  {
    id: ESRN_2_ID,
    name: "Renewal Readiness",
    capability: RENEWAL_READINESS_CAPABILITY,
    version: RENEWAL_READINESS_VERSION,
    baselineTag: ESRN1_RENEWAL_STATE_BASELINE,
    modulePath: "lib/commercial/renewal/renewal-readiness.ts",
    verifyScript: "scripts/verify-esrn-2-renewal-readiness.ts",
    buildApi: "buildRenewalReadiness",
    status: "frozen",
  },
  {
    id: ESRN_3_ID,
    name: "Renewal Action Signal",
    capability: RENEWAL_ACTION_SIGNAL_CAPABILITY,
    version: RENEWAL_ACTION_SIGNAL_VERSION,
    baselineTag: ESRN2_RENEWAL_READINESS_BASELINE,
    modulePath: "lib/commercial/renewal/renewal-action-signal.ts",
    verifyScript: "scripts/verify-esrn-3-renewal-action-signal.ts",
    buildApi: "buildRenewalActionSignal",
    status: "frozen",
  },
] as const;

export type EsrnFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1;
  expansionOperationsBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1;
  esxpBaseline: typeof ESXP_V1_BASELINE;
  packBaseline: typeof ESRN2_RENEWAL_READINESS_BASELINE;
  signalVersion: typeof RENEWAL_ACTION_SIGNAL_VERSION;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EsrnComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESRN_FREEZE_VERSION;
    "ESRN-1": typeof RENEWAL_STATE_VERSION;
    "ESRN-2": typeof RENEWAL_READINESS_VERSION;
    "ESRN-3": typeof RENEWAL_ACTION_SIGNAL_VERSION;
  };
  componentFingerprints: {
    "ESRN-1": string;
    "ESRN-2": string;
    "ESRN-3": string;
  };
}>;

export type EsrnFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESRN_FREEZE_ID;
  capability: typeof ESRN_FREEZE_CAPABILITY;
  version: typeof ESRN_FREEZE_VERSION;
  codename: typeof ESRN_FREEZE_CODENAME;
  freezeDate: typeof ESRN_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1;
  expansionOperationsBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1;
  esxpBaseline: typeof ESXP_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EsrnFreezeManifest;
  signalFingerprint: string;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESRN-1~ESRN-3";
    closure: "ESRN-Freeze";
    chain: "STATE -> READINESS -> ACTION_SIGNAL -> FROZEN";
    product: "Enterprise SaaS Renewal Operations v1";
    immutable: true;
    freezeOnly: true;
    noEsxpMutation: true;
    noEscrMutation: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noContractExecution: true;
    noPaymentExecution: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: EsrnFreeze | null = null;

function cloneFreeze(row: EsrnFreeze): EsrnFreeze {
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

function stablePayload(row: Omit<EsrnFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    expansionOperationsBaseline: row.expansionOperationsBaseline,
    esxpBaseline: row.esxpBaseline,
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

function computeFingerprint(row: Omit<EsrnFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(): EsrnFreezeManifest {
  const state = getRenewalState();
  const readiness = getRenewalReadiness();
  const signal = getRenewalActionSignal();
  return {
    productBaseline: ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1,
    expansionOperationsBaseline:
      ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1,
    esxpBaseline: ESXP_V1_BASELINE,
    packBaseline: ESRN2_RENEWAL_READINESS_BASELINE,
    signalVersion: RENEWAL_ACTION_SIGNAL_VERSION,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESRN_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESRN_FREEZE_VERSION,
      "ESRN-1": RENEWAL_STATE_VERSION,
      "ESRN-2": RENEWAL_READINESS_VERSION,
      "ESRN-3": RENEWAL_ACTION_SIGNAL_VERSION,
    },
    componentFingerprints: {
      "ESRN-1": state.fingerprint,
      "ESRN-2": readiness.fingerprint,
      "ESRN-3": signal.fingerprint,
    },
  };
}

function deriveFromSignal(signal: RenewalActionSignal): EsrnFreeze {
  const manifest = buildManifest();
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESRN_COMPONENTS.length === 3 &&
    ESRN_COMPONENTS.every((c) => c.status === "frozen") &&
    signal.recordCount > 0 &&
    signal.parentVersion === RENEWAL_READINESS_VERSION &&
    signal.version === RENEWAL_ACTION_SIGNAL_VERSION &&
    signal.scope.noRuntimeSideEffects === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.signalVersion === "esrn-3-renewal-action-signal-1" &&
    manifest.productBaseline === ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1 &&
    manifest.expansionOperationsBaseline ===
      ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1;

  const withoutFp: Omit<EsrnFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESRN_FREEZE_ID,
    capability: ESRN_FREEZE_CAPABILITY,
    version: ESRN_FREEZE_VERSION,
    codename: ESRN_FREEZE_CODENAME,
    freezeDate: ESRN_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1,
    expansionOperationsBaseline:
      ENTERPRISE_SAAS_CUSTOMER_EXPANSION_OPERATIONS_V1,
    esxpBaseline: ESXP_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    signalFingerprint: signal.fingerprint,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESRN_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESRN-1~ESRN-3",
      closure: "ESRN-Freeze",
      chain: "STATE -> READINESS -> ACTION_SIGNAL -> FROZEN",
      product: "Enterprise SaaS Renewal Operations v1",
      immutable: true,
      freezeOnly: true,
      noEsxpMutation: true,
      noEscrMutation: true,
      noEscsMutation: true,
      noEsclMutation: true,
      noEsceMutation: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
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

export function buildEsrnFreeze(): EsrnFreeze {
  const signal = getRenewalActionSignal();
  const out = deriveFromSignal(signal);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEsrnFreeze(): EsrnFreeze {
  if (!cached) {
    return buildEsrnFreeze();
  }
  return cloneFreeze(cached);
}

export function esrnFreezeFingerprint(row?: EsrnFreeze): string {
  return (row ?? getEsrnFreeze()).fingerprint;
}

export function clearEsrnFreeze(): void {
  cached = null;
}

export function ensureSignalThenBuildEsrnFreeze(): EsrnFreeze {
  getRenewalActionSignal();
  clearEsrnFreeze();
  return buildEsrnFreeze();
}
