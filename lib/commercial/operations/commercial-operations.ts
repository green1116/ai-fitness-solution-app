/**
 * ESCO-1 — Commercial Operations Foundation
 * Deterministic foundation linking customer → tenant → production → delivery →
 * adoption → commercial signal on Enterprise SaaS Runtime Operations v1.
 * Reuses PG + ARL + ESRO v1. No CRM/billing / ARL v2 / RSO-9 / redesign.
 */

import { createHash } from "node:crypto";

import {
  APPLICATION_PRODUCTION_RELEASE_CAPABILITY,
  APPLICATION_PRODUCTION_RELEASE_VERSION,
  ARL_5_ID,
  getApplicationProductionRelease,
} from "../../release/application/production-release";
import {
  APPLICATION_DEPLOYMENT_EVIDENCE_CAPABILITY,
  APPLICATION_DEPLOYMENT_EVIDENCE_VERSION,
  ARL_4_ID,
  getApplicationDeploymentEvidence,
} from "../../release/application/deployment";
import {
  CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY,
  CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
  PG_2_1_ID,
  getCustomerLifecycleRegistry,
} from "../../release/customer/customer-lifecycle-registry";
import {
  ADOPTION_HEALTH_CAPABILITY,
  ADOPTION_HEALTH_VERSION,
  PG_2_2_ID,
  getAdoptionHealth,
} from "../../release/customer/adoption-health";
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
  COMMERCIAL_HEALTH_CAPABILITY,
  COMMERCIAL_HEALTH_VERSION,
  PG_3_2_ID,
  getCommercialHealth,
} from "../../release/revenue/commercial-health";
import {
  ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
  RSO_8_ID,
  RUNTIME_OPERATIONS_FREEZE_VERSION,
  getRuntimeOperationsFreeze,
} from "../../runtime/freeze";
import {
  TENANT_OPERATIONS_CAPABILITY,
  TENANT_OPERATIONS_VERSION,
  RSO_5_ID,
  getTenantOperations,
} from "../../runtime/tenant";

export const ESCO_1_ID = "ESCO-1" as const;
export const COMMERCIAL_OPERATIONS_CAPABILITY =
  "CommercialOperations" as const;
export const COMMERCIAL_OPERATIONS_VERSION =
  "esco-1-commercial-operations-1" as const;
/** ESRO v1 product baseline (RSO-8 freeze). */
export const ESRO_V1_BASELINE =
  ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;

export const COMMERCIAL_OPERATIONS_STAGES = [
  "CUSTOMER",
  "TENANT",
  "PRODUCTION",
  "DELIVERY",
  "ADOPTION",
  "COMMERCIAL_SIGNAL",
] as const;
export type CommercialOperationsStage =
  (typeof COMMERCIAL_OPERATIONS_STAGES)[number];

export const COMMERCIAL_OPERATIONS_STATUSES = [
  "READY",
  "BLOCKED",
] as const;
export type CommercialOperationsStatus =
  (typeof COMMERCIAL_OPERATIONS_STATUSES)[number];

export type CommercialOperationsLink = Readonly<{
  stage: CommercialOperationsStage;
  sourcePack: string;
  sourceCapability: string;
  sourceVersion: string;
  sourceFingerprint: string;
  ordinal: number;
}>;

export type CommercialOperations = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCO_1_ID;
  capability: typeof COMMERCIAL_OPERATIONS_CAPABILITY;
  version: typeof COMMERCIAL_OPERATIONS_VERSION;
  baselineTag: typeof ESRO_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  status: CommercialOperationsStatus;
  links: readonly CommercialOperationsLink[];
  linkCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  esroPack: typeof RSO_8_ID;
  esroVersion: typeof RUNTIME_OPERATIONS_FREEZE_VERSION;
  esroFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noArlV2: true;
    noRso9: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: CommercialOperations | null = null;

function cloneOps(row: CommercialOperations): CommercialOperations {
  return {
    ...row,
    links: row.links.map((l) => ({ ...l })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<CommercialOperations, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    productionBaseline: row.productionBaseline,
    status: row.status,
    links: row.links,
    linkCount: row.linkCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    esroPack: row.esroPack,
    esroVersion: row.esroVersion,
    esroFingerprint: row.esroFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CommercialOperations, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildLinks(): CommercialOperationsLink[] {
  const customer = getCustomerLifecycleRegistry();
  const tenant = getTenantOperations();
  const production = getApplicationProductionRelease();
  const delivery = getApplicationDeploymentEvidence();
  const adoption = getAdoptionHealth();
  const commercial = getCommercialHealth();

  return [
    {
      stage: "CUSTOMER",
      sourcePack: PG_2_1_ID,
      sourceCapability: CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY,
      sourceVersion: CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
      sourceFingerprint: customer.fingerprint,
      ordinal: 1,
    },
    {
      stage: "TENANT",
      sourcePack: RSO_5_ID,
      sourceCapability: TENANT_OPERATIONS_CAPABILITY,
      sourceVersion: TENANT_OPERATIONS_VERSION,
      sourceFingerprint: tenant.fingerprint,
      ordinal: 2,
    },
    {
      stage: "PRODUCTION",
      sourcePack: ARL_5_ID,
      sourceCapability: APPLICATION_PRODUCTION_RELEASE_CAPABILITY,
      sourceVersion: APPLICATION_PRODUCTION_RELEASE_VERSION,
      sourceFingerprint: production.fingerprint,
      ordinal: 3,
    },
    {
      stage: "DELIVERY",
      sourcePack: ARL_4_ID,
      sourceCapability: APPLICATION_DEPLOYMENT_EVIDENCE_CAPABILITY,
      sourceVersion: APPLICATION_DEPLOYMENT_EVIDENCE_VERSION,
      sourceFingerprint: delivery.fingerprint,
      ordinal: 4,
    },
    {
      stage: "ADOPTION",
      sourcePack: PG_2_2_ID,
      sourceCapability: ADOPTION_HEALTH_CAPABILITY,
      sourceVersion: ADOPTION_HEALTH_VERSION,
      sourceFingerprint: adoption.fingerprint,
      ordinal: 5,
    },
    {
      stage: "COMMERCIAL_SIGNAL",
      sourcePack: PG_3_2_ID,
      sourceCapability: COMMERCIAL_HEALTH_CAPABILITY,
      sourceVersion: COMMERCIAL_HEALTH_VERSION,
      sourceFingerprint: commercial.fingerprint,
      ordinal: 6,
    },
  ];
}

function deriveCommercialOperations(): CommercialOperations {
  const esro = getRuntimeOperationsFreeze();
  const links = buildLinks();
  const ready =
    esro.certification === "certified" &&
    esro.baseline.productBaseline === ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1 &&
    links.length === COMMERCIAL_OPERATIONS_STAGES.length &&
    links.every((l) => l.sourceFingerprint.length === 64);

  const withoutFp: Omit<CommercialOperations, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCO_1_ID,
    capability: COMMERCIAL_OPERATIONS_CAPABILITY,
    version: COMMERCIAL_OPERATIONS_VERSION,
    baselineTag: ESRO_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    status: ready ? "READY" : "BLOCKED",
    links,
    linkCount: links.length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    esroPack: RSO_8_ID,
    esroVersion: RUNTIME_OPERATIONS_FREEZE_VERSION,
    esroFingerprint: esro.fingerprint,
    scope: {
      readOnly: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
      noArlV2: true,
      noRso9: true,
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

/** Build CommercialOperations foundation from PG + ARL + ESRO v1. */
export function buildCommercialOperations(): CommercialOperations {
  const out = deriveCommercialOperations();
  cached = cloneOps(out);
  return cloneOps(cached);
}

/** Get last built CommercialOperations, or build if none cached. */
export function getCommercialOperations(): CommercialOperations {
  if (!cached) {
    return buildCommercialOperations();
  }
  return cloneOps(cached);
}

/** Stable content fingerprint for determinism checks. */
export function commercialOperationsFingerprint(
  row?: CommercialOperations,
): string {
  const v = row ?? getCommercialOperations();
  return v.fingerprint;
}

/** Test helper — clears ESCO-1 cache only. */
export function clearCommercialOperations(): void {
  cached = null;
}
