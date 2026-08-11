/**
 * ESCP v1 Freeze — Enterprise SaaS Customer Planning Operations v1
 * Freezes ESCP-1..3: Recommendation → State → Action → Portfolio.
 * Product: enterprise-saas-customer-planning-operations-v1.
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
  CUSTOMER_PLAN_ACTION_CAPABILITY,
  CUSTOMER_PLAN_ACTION_VERSION,
  ESCP1_CUSTOMER_PLAN_STATE_BASELINE,
  ESCP_2_ID,
  getCustomerPlanAction,
} from "./customer-plan-action";
import {
  CUSTOMER_PLAN_PORTFOLIO_CAPABILITY,
  CUSTOMER_PLAN_PORTFOLIO_VERSION,
  ESCP2_CUSTOMER_PLAN_ACTION_BASELINE,
  ESCP_3_ID,
  getCustomerPlanPortfolio,
  type CustomerPlanPortfolio,
} from "./customer-plan-portfolio";
import {
  CUSTOMER_PLAN_STATE_CAPABILITY,
  CUSTOMER_PLAN_STATE_VERSION,
  ESCP_1_ID,
  ESCI_V1_BASELINE,
  getCustomerPlanState,
} from "./customer-plan-state";

export const ESCP_FREEZE_ID = "ESCP-Freeze" as const;
export const ESCP_FREEZE_CAPABILITY =
  "EscpCustomerPlanningOperationsFreeze" as const;
export const ESCP_FREEZE_VERSION = "escp-freeze-1.0.0" as const;
export const ESCP_FREEZE_CODENAME =
  "Enterprise SaaS Customer Planning Operations v1 Freeze" as const;
export const ESCP_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1 =
  "enterprise-saas-customer-planning-operations-v1" as const;

export type EscpComponentStatus = "frozen";

export type EscpComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EscpComponentStatus;
}>;

export const ESCP_COMPONENTS: readonly EscpComponentEntry[] = [
  {
    id: ESCP_1_ID,
    name: "Customer Plan State",
    capability: CUSTOMER_PLAN_STATE_CAPABILITY,
    version: CUSTOMER_PLAN_STATE_VERSION,
    baselineTag: ESCI_V1_BASELINE,
    modulePath: "lib/commercial/planning/customer-plan-state.ts",
    verifyScript: "scripts/verify-escp-1-customer-plan-state.ts",
    buildApi: "buildCustomerPlanState",
    status: "frozen",
  },
  {
    id: ESCP_2_ID,
    name: "Customer Plan Action",
    capability: CUSTOMER_PLAN_ACTION_CAPABILITY,
    version: CUSTOMER_PLAN_ACTION_VERSION,
    baselineTag: ESCP1_CUSTOMER_PLAN_STATE_BASELINE,
    modulePath: "lib/commercial/planning/customer-plan-action.ts",
    verifyScript: "scripts/verify-escp-2-customer-plan-action.ts",
    buildApi: "buildCustomerPlanAction",
    status: "frozen",
  },
  {
    id: ESCP_3_ID,
    name: "Customer Plan Portfolio",
    capability: CUSTOMER_PLAN_PORTFOLIO_CAPABILITY,
    version: CUSTOMER_PLAN_PORTFOLIO_VERSION,
    baselineTag: ESCP2_CUSTOMER_PLAN_ACTION_BASELINE,
    modulePath: "lib/commercial/planning/customer-plan-portfolio.ts",
    verifyScript: "scripts/verify-escp-3-customer-plan-portfolio.ts",
    buildApi: "buildCustomerPlanPortfolio",
    status: "frozen",
  },
] as const;

export type EscpFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1;
  intelligenceOperationsBaseline: typeof ESCI_V1_BASELINE;
  packBaseline: typeof ESCP2_CUSTOMER_PLAN_ACTION_BASELINE;
  portfolioVersion: typeof CUSTOMER_PLAN_PORTFOLIO_VERSION;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EscpComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESCP_FREEZE_VERSION;
    "ESCP-1": typeof CUSTOMER_PLAN_STATE_VERSION;
    "ESCP-2": typeof CUSTOMER_PLAN_ACTION_VERSION;
    "ESCP-3": typeof CUSTOMER_PLAN_PORTFOLIO_VERSION;
  };
  componentFingerprints: {
    "ESCP-1": string;
    "ESCP-2": string;
    "ESCP-3": string;
  };
}>;

export type EscpFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCP_FREEZE_ID;
  capability: typeof ESCP_FREEZE_CAPABILITY;
  version: typeof ESCP_FREEZE_VERSION;
  codename: typeof ESCP_FREEZE_CODENAME;
  freezeDate: typeof ESCP_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1;
  intelligenceOperationsBaseline: typeof ESCI_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EscpFreezeManifest;
  portfolioFingerprint: string;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESCP-1~ESCP-3";
    closure: "ESCP-Freeze";
    chain: "RECOMMENDATION -> STATE -> ACTION -> PORTFOLIO -> FROZEN";
    product: "Enterprise SaaS Customer Planning Operations v1";
    immutable: true;
    freezeOnly: true;
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

let cached: EscpFreeze | null = null;

function cloneFreeze(row: EscpFreeze): EscpFreeze {
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

function stablePayload(row: Omit<EscpFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    intelligenceOperationsBaseline: row.intelligenceOperationsBaseline,
    productionBaseline: row.productionBaseline,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    manifest: row.manifest,
    portfolioFingerprint: row.portfolioFingerprint,
    verificationSummary: row.verificationSummary,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<EscpFreeze, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(): EscpFreezeManifest {
  const state = getCustomerPlanState();
  const action = getCustomerPlanAction();
  const portfolio = getCustomerPlanPortfolio();
  return {
    productBaseline: ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1,
    intelligenceOperationsBaseline: ESCI_V1_BASELINE,
    packBaseline: ESCP2_CUSTOMER_PLAN_ACTION_BASELINE,
    portfolioVersion: CUSTOMER_PLAN_PORTFOLIO_VERSION,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESCP_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESCP_FREEZE_VERSION,
      "ESCP-1": CUSTOMER_PLAN_STATE_VERSION,
      "ESCP-2": CUSTOMER_PLAN_ACTION_VERSION,
      "ESCP-3": CUSTOMER_PLAN_PORTFOLIO_VERSION,
    },
    componentFingerprints: {
      "ESCP-1": state.fingerprint,
      "ESCP-2": action.fingerprint,
      "ESCP-3": portfolio.fingerprint,
    },
  };
}

function deriveFromPortfolio(portfolio: CustomerPlanPortfolio): EscpFreeze {
  const manifest = buildManifest();
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESCP_COMPONENTS.length === 3 &&
    ESCP_COMPONENTS.every((c) => c.status === "frozen") &&
    portfolio.recordCount > 0 &&
    portfolio.parentVersion === CUSTOMER_PLAN_ACTION_VERSION &&
    portfolio.version === CUSTOMER_PLAN_PORTFOLIO_VERSION &&
    portfolio.scope.noRuntimeSideEffects === true &&
    portfolio.scope.planningOnly === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.portfolioVersion === "escp-3-customer-plan-portfolio-1" &&
    manifest.productBaseline ===
      ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1 &&
    manifest.intelligenceOperationsBaseline === ESCI_V1_BASELINE;

  const withoutFp: Omit<EscpFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCP_FREEZE_ID,
    capability: ESCP_FREEZE_CAPABILITY,
    version: ESCP_FREEZE_VERSION,
    codename: ESCP_FREEZE_CODENAME,
    freezeDate: ESCP_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_PLANNING_OPERATIONS_V1,
    intelligenceOperationsBaseline: ESCI_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    portfolioFingerprint: portfolio.fingerprint,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESCP_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESCP-1~ESCP-3",
      closure: "ESCP-Freeze",
      chain: "RECOMMENDATION -> STATE -> ACTION -> PORTFOLIO -> FROZEN",
      product: "Enterprise SaaS Customer Planning Operations v1",
      immutable: true,
      freezeOnly: true,
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

export function buildEscpFreeze(): EscpFreeze {
  const portfolio = getCustomerPlanPortfolio();
  const out = deriveFromPortfolio(portfolio);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

export function getEscpFreeze(): EscpFreeze {
  if (!cached) {
    return buildEscpFreeze();
  }
  return cloneFreeze(cached);
}

export function escpFreezeFingerprint(row?: EscpFreeze): string {
  return (row ?? getEscpFreeze()).fingerprint;
}

export function clearEscpFreeze(): void {
  cached = null;
}

export function ensurePortfolioThenBuildEscpFreeze(): EscpFreeze {
  getCustomerPlanPortfolio();
  clearEscpFreeze();
  return buildEscpFreeze();
}
