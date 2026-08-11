/**
 * ESCO-2 — Commercial Health Foundation
 * Deterministic commercial health projection from ESCO-1 CommercialOperations.
 * Baseline: ESCO-1 / enterprise-saas-runtime-operations-v1.
 * Read-only. No CRM/billing / ARL v2 / RSO-9 / redesign.
 */

import { createHash } from "node:crypto";

import {
  getAdoptionHealth,
  type AdoptionHealthStatus,
} from "../../release/customer/adoption-health";
import { getCustomerLifecycleRegistry } from "../../release/customer/customer-lifecycle-registry";
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
  getCommercialHealth as getPgCommercialHealth,
  type CommercialHealthStatus as PgCommercialHealthStatus,
} from "../../release/revenue/commercial-health";
import { ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1 } from "../../runtime/freeze";
import {
  getTenantOperations,
  type TenantOperationStatus,
} from "../../runtime/tenant";
import {
  COMMERCIAL_OPERATIONS_VERSION,
  ESCO_1_ID,
  ESRO_V1_BASELINE,
  buildCommercialOperations,
  getCommercialOperations,
  type CommercialOperations,
  type CommercialOperationsStatus,
} from "./commercial-operations";

export const ESCO_2_ID = "ESCO-2" as const;
export const COMMERCIAL_HEALTH_CAPABILITY = "CommercialHealth" as const;
export const COMMERCIAL_HEALTH_VERSION =
  "esco-2-commercial-health-1" as const;
/** ESCO-1 commercial operations pack baseline. */
export const ESCO1_COMMERCIAL_OPERATIONS_BASELINE =
  "esco1-commercial-operations-v1" as const;

export const COMMERCIAL_HEALTH_LEVELS = [
  "HEALTHY",
  "WATCH",
  "RISK",
] as const;
export type CommercialHealthLevel =
  (typeof COMMERCIAL_HEALTH_LEVELS)[number];

export type CommercialHealthRecord = Readonly<{
  customerId: string;
  tenantId: string;
  health: CommercialHealthLevel;
  reason: string;
  ordinal: number;
}>;

export type CommercialHealth = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCO_2_ID;
  capability: typeof COMMERCIAL_HEALTH_CAPABILITY;
  version: typeof COMMERCIAL_HEALTH_VERSION;
  baselineTag: typeof ESCO1_COMMERCIAL_OPERATIONS_BASELINE;
  parentPack: typeof ESCO_1_ID;
  parentVersion: typeof COMMERCIAL_OPERATIONS_VERSION;
  parentBaseline: typeof ESRO_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  productBaseline: typeof ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;
  operationsStatus: CommercialOperationsStatus;
  records: readonly CommercialHealthRecord[];
  recordCount: number;
  healthyCount: number;
  watchCount: number;
  riskCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  commercialOperationsFingerprint: string;
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

let cached: CommercialHealth | null = null;

function cloneHealth(row: CommercialHealth): CommercialHealth {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<CommercialHealth, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    productBaseline: row.productBaseline,
    operationsStatus: row.operationsStatus,
    records: row.records,
    recordCount: row.recordCount,
    healthyCount: row.healthyCount,
    watchCount: row.watchCount,
    riskCount: row.riskCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    commercialOperationsFingerprint: row.commercialOperationsFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CommercialHealth, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectLevel(input: {
  operationsStatus: CommercialOperationsStatus;
  adoption: AdoptionHealthStatus;
  commercial: PgCommercialHealthStatus;
  tenant: TenantOperationStatus;
}): { health: CommercialHealthLevel; reason: string } {
  if (input.operationsStatus === "BLOCKED") {
    return { health: "RISK", reason: "operations-blocked" };
  }
  if (
    input.adoption === "CRITICAL" ||
    input.commercial === "CRITICAL" ||
    input.tenant === "SUSPENDED"
  ) {
    return { health: "RISK", reason: "critical-signal" };
  }
  if (
    input.adoption === "WATCH" ||
    input.adoption === "AT_RISK" ||
    input.commercial === "WATCH" ||
    input.commercial === "AT_RISK" ||
    input.tenant === "WATCH" ||
    input.tenant === "STAGED"
  ) {
    return { health: "WATCH", reason: "watch-signal" };
  }
  return { health: "HEALTHY", reason: "signals-stable" };
}

function deriveRecords(
  operations: CommercialOperations,
): CommercialHealthRecord[] {
  const customers = getCustomerLifecycleRegistry().customers;
  const adoptionById = new Map(
    getAdoptionHealth().records.map((r) => [r.customerId, r] as const),
  );
  const commercialById = new Map(
    getPgCommercialHealth().records.map((r) => [r.customerId, r] as const),
  );
  const tenants = getTenantOperations().operations;

  if (tenants.length === 0) return [];

  return customers.map((customer, index) => {
    const tenant = tenants[index % tenants.length]!;
    const adoption = adoptionById.get(customer.customerId);
    const commercial = commercialById.get(customer.customerId);
    const projected = projectLevel({
      operationsStatus: operations.status,
      adoption: adoption?.healthStatus ?? "CRITICAL",
      commercial: commercial?.commercialHealth ?? "CRITICAL",
      tenant: tenant.status,
    });

    return {
      customerId: customer.customerId,
      tenantId: tenant.tenantId,
      health: projected.health,
      reason: projected.reason,
      ordinal: index + 1,
    };
  });
}

function deriveFromOperations(
  operations: CommercialOperations,
): CommercialHealth {
  const records = deriveRecords(operations);
  const healthyCount = records.filter((r) => r.health === "HEALTHY").length;
  const watchCount = records.filter((r) => r.health === "WATCH").length;
  const riskCount = records.filter((r) => r.health === "RISK").length;

  const withoutFp: Omit<CommercialHealth, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCO_2_ID,
    capability: COMMERCIAL_HEALTH_CAPABILITY,
    version: COMMERCIAL_HEALTH_VERSION,
    baselineTag: ESCO1_COMMERCIAL_OPERATIONS_BASELINE,
    parentPack: ESCO_1_ID,
    parentVersion: COMMERCIAL_OPERATIONS_VERSION,
    parentBaseline: ESRO_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    productBaseline: ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    operationsStatus: operations.status,
    records,
    recordCount: records.length,
    healthyCount,
    watchCount,
    riskCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    commercialOperationsFingerprint: operations.fingerprint,
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

/** Build CommercialHealth projection from ESCO-1 CommercialOperations. */
export function buildCommercialHealth(): CommercialHealth {
  const operations = getCommercialOperations();
  const out = deriveFromOperations(operations);
  cached = cloneHealth(out);
  return cloneHealth(cached);
}

/** Get last built CommercialHealth, or build if none cached. */
export function getCommercialHealth(): CommercialHealth {
  if (!cached) {
    return buildCommercialHealth();
  }
  return cloneHealth(cached);
}

/** Stable content fingerprint for determinism checks. */
export function commercialHealthFingerprint(row?: CommercialHealth): string {
  const v = row ?? getCommercialHealth();
  return v.fingerprint;
}

/** Test helper — clears ESCO-2 cache only. */
export function clearCommercialHealth(): void {
  cached = null;
}

/** Ensure ESCO-1 then build ESCO-2 (verify scripts). */
export function ensureOperationsThenBuildCommercialHealth(): CommercialHealth {
  buildCommercialOperations();
  clearCommercialHealth();
  return buildCommercialHealth();
}
