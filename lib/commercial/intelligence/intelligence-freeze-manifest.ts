/**
 * ESCI v1 Freeze — Enterprise SaaS Customer Intelligence Operations v1
 * Freezes ESCI-1..4: State → Signal → Portfolio → Recommendation.
 * Product: enterprise-saas-customer-intelligence-operations-v1.
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
  CUSTOMER_INTELLIGENCE_STATE_CAPABILITY,
  CUSTOMER_INTELLIGENCE_STATE_VERSION,
  ESCA_V1_BASELINE,
  ESCI_1_ID,
  getCustomerIntelligenceState,
} from "./customer-intelligence-state";
import {
  CUSTOMER_PORTFOLIO_INTELLIGENCE_CAPABILITY,
  CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION,
  ESCI2_INTELLIGENCE_SIGNAL_BASELINE,
  ESCI_3_ID,
  getCustomerPortfolioIntelligence,
} from "./customer-portfolio-intelligence";
import {
  ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE,
  ESCI_2_ID,
  INTELLIGENCE_SIGNAL_CAPABILITY,
  INTELLIGENCE_SIGNAL_VERSION,
  getIntelligenceSignal,
} from "./intelligence-signal";
import {
  ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE,
  ESCI_4_ID,
  INTELLIGENCE_RECOMMENDATION_CAPABILITY,
  INTELLIGENCE_RECOMMENDATION_VERSION,
  getIntelligenceRecommendation,
  type IntelligenceRecommendation,
} from "./intelligence-recommendation";

export const ESCI_FREEZE_ID = "ESCI-Freeze" as const;
export const ESCI_FREEZE_CAPABILITY =
  "EsciCustomerIntelligenceOperationsFreeze" as const;
export const ESCI_FREEZE_VERSION = "esci-freeze-1.0.0" as const;
export const ESCI_FREEZE_CODENAME =
  "Enterprise SaaS Customer Intelligence Operations v1 Freeze" as const;
export const ESCI_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1 =
  "enterprise-saas-customer-intelligence-operations-v1" as const;

export type EsciComponentStatus = "frozen";

export type EsciComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EsciComponentStatus;
}>;

export const ESCI_COMPONENTS: readonly EsciComponentEntry[] = [
  {
    id: ESCI_1_ID,
    name: "Customer Intelligence State",
    capability: CUSTOMER_INTELLIGENCE_STATE_CAPABILITY,
    version: CUSTOMER_INTELLIGENCE_STATE_VERSION,
    baselineTag: ESCA_V1_BASELINE,
    modulePath: "lib/commercial/intelligence/customer-intelligence-state.ts",
    verifyScript: "scripts/verify-esci-1-customer-intelligence-state.ts",
    buildApi: "buildCustomerIntelligenceState",
    status: "frozen",
  },
  {
    id: ESCI_2_ID,
    name: "Intelligence Signal",
    capability: INTELLIGENCE_SIGNAL_CAPABILITY,
    version: INTELLIGENCE_SIGNAL_VERSION,
    baselineTag: ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE,
    modulePath: "lib/commercial/intelligence/intelligence-signal.ts",
    verifyScript: "scripts/verify-esci-2-intelligence-signal.ts",
    buildApi: "buildIntelligenceSignal",
    status: "frozen",
  },
  {
    id: ESCI_3_ID,
    name: "Customer Portfolio Intelligence",
    capability: CUSTOMER_PORTFOLIO_INTELLIGENCE_CAPABILITY,
    version: CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION,
    baselineTag: ESCI2_INTELLIGENCE_SIGNAL_BASELINE,
    modulePath: "lib/commercial/intelligence/customer-portfolio-intelligence.ts",
    verifyScript: "scripts/verify-esci-3-customer-portfolio-intelligence.ts",
    buildApi: "buildCustomerPortfolioIntelligence",
    status: "frozen",
  },
  {
    id: ESCI_4_ID,
    name: "Intelligence Recommendation",
    capability: INTELLIGENCE_RECOMMENDATION_CAPABILITY,
    version: INTELLIGENCE_RECOMMENDATION_VERSION,
    baselineTag: ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE,
    modulePath: "lib/commercial/intelligence/intelligence-recommendation.ts",
    verifyScript: "scripts/verify-esci-4-intelligence-recommendation.ts",
    buildApi: "buildIntelligenceRecommendation",
    status: "frozen",
  },
] as const;

export type EsciFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1;
  advocacyOperationsBaseline: typeof ESCA_V1_BASELINE;
  packBaseline: typeof ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE;
  recommendationVersion: typeof INTELLIGENCE_RECOMMENDATION_VERSION;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EsciComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESCI_FREEZE_VERSION;
    "ESCI-1": typeof CUSTOMER_INTELLIGENCE_STATE_VERSION;
    "ESCI-2": typeof INTELLIGENCE_SIGNAL_VERSION;
    "ESCI-3": typeof CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION;
    "ESCI-4": typeof INTELLIGENCE_RECOMMENDATION_VERSION;
  };
  componentFingerprints: {
    "ESCI-1": string;
    "ESCI-2": string;
    "ESCI-3": string;
    "ESCI-4": string;
  };
}>;

export type EsciFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCI_FREEZE_ID;
  capability: typeof ESCI_FREEZE_CAPABILITY;
  version: typeof ESCI_FREEZE_VERSION;
  codename: typeof ESCI_FREEZE_CODENAME;
  freezeDate: typeof ESCI_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1;
  advocacyOperationsBaseline: typeof ESCA_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EsciFreezeManifest;
  recommendationFingerprint: string;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESCI-1~ESCI-4";
    closure: "ESCI-Freeze";
    chain: "STATE -> SIGNAL -> PORTFOLIO -> RECOMMENDATION -> FROZEN";
    product: "Enterprise SaaS Customer Intelligence Operations v1";
    immutable: true;
    freezeOnly: true;
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

let cached: EsciFreeze | null = null;

function cloneFreeze(row: EsciFreeze): EsciFreeze {
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

function stablePayload(row: Omit<EsciFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    advocacyOperationsBaseline: row.advocacyOperationsBaseline,
    productionBaseline: row.productionBaseline,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    manifest: row.manifest,
    recommendationFingerprint: row.recommendationFingerprint,
    verificationSummary: row.verificationSummary,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EsciFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(): EsciFreezeManifest {
  const state = getCustomerIntelligenceState();
  const signal = getIntelligenceSignal();
  const portfolio = getCustomerPortfolioIntelligence();
  const recommendation = getIntelligenceRecommendation();
  return {
    productBaseline: ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1,
    advocacyOperationsBaseline: ESCA_V1_BASELINE,
    packBaseline: ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE,
    recommendationVersion: INTELLIGENCE_RECOMMENDATION_VERSION,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESCI_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESCI_FREEZE_VERSION,
      "ESCI-1": CUSTOMER_INTELLIGENCE_STATE_VERSION,
      "ESCI-2": INTELLIGENCE_SIGNAL_VERSION,
      "ESCI-3": CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION,
      "ESCI-4": INTELLIGENCE_RECOMMENDATION_VERSION,
    },
    componentFingerprints: {
      "ESCI-1": state.fingerprint,
      "ESCI-2": signal.fingerprint,
      "ESCI-3": portfolio.fingerprint,
      "ESCI-4": recommendation.fingerprint,
    },
  };
}

function deriveFromRecommendation(
  recommendation: IntelligenceRecommendation,
): EsciFreeze {
  const manifest = buildManifest();
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESCI_COMPONENTS.length === 4 &&
    ESCI_COMPONENTS.every((c) => c.status === "frozen") &&
    recommendation.recordCount > 0 &&
    recommendation.parentVersion === CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION &&
    recommendation.version === INTELLIGENCE_RECOMMENDATION_VERSION &&
    recommendation.scope.noRuntimeSideEffects === true &&
    recommendation.scope.recommendationOnly === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.recommendationVersion ===
      "esci-4-intelligence-recommendation-1" &&
    manifest.productBaseline ===
      ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1 &&
    manifest.advocacyOperationsBaseline === ESCA_V1_BASELINE;

  const withoutFp: Omit<EsciFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCI_FREEZE_ID,
    capability: ESCI_FREEZE_CAPABILITY,
    version: ESCI_FREEZE_VERSION,
    codename: ESCI_FREEZE_CODENAME,
    freezeDate: ESCI_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1,
    advocacyOperationsBaseline: ESCA_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    recommendationFingerprint: recommendation.fingerprint,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESCI_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESCI-1~ESCI-4",
      closure: "ESCI-Freeze",
      chain: "STATE -> SIGNAL -> PORTFOLIO -> RECOMMENDATION -> FROZEN",
      product: "Enterprise SaaS Customer Intelligence Operations v1",
      immutable: true,
      freezeOnly: true,
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

export function buildEsciFreeze(): EsciFreeze {
  const recommendation = getIntelligenceRecommendation();
  const out = deriveFromRecommendation(recommendation);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEsciFreeze(): EsciFreeze {
  if (!cached) {
    return buildEsciFreeze();
  }
  return cloneFreeze(cached);
}

export function esciFreezeFingerprint(row?: EsciFreeze): string {
  return (row ?? getEsciFreeze()).fingerprint;
}

export function clearEsciFreeze(): void {
  cached = null;
}

export function ensureRecommendationThenBuildEsciFreeze(): EsciFreeze {
  getIntelligenceRecommendation();
  clearEsciFreeze();
  return buildEsciFreeze();
}
