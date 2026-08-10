/**
 * PG-3.2 — Commercial Health
 * Read-only deterministic commercial health contract (no live billing probes).
 * Baseline: pg3-revenue-lifecycle-v1 (derives from PG-3.1).
 * No DB / UI / billing / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import { RELEASE_ID } from "../release-readiness";
import {
  PG_3_1_ID,
  PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE,
  REVENUE_LIFECYCLE_REGISTRY_VERSION,
  buildRevenueLifecycleRegistry,
  getRevenueLifecycleRegistry,
  type CommercialStage,
  type ExpansionSignal,
  type RevenueLifecycleRecord,
  type RevenueLifecycleRegistry,
  type RevenueStatus,
} from "./revenue-lifecycle-registry";

export const PG_3_2_ID = "PG-3.2" as const;
export const COMMERCIAL_HEALTH_CAPABILITY = "CommercialHealth" as const;
export const COMMERCIAL_HEALTH_VERSION = "pg-3.2-commercial-health-1" as const;
/** PG-3.1 revenue lifecycle pack baseline. */
export const PG3_REVENUE_LIFECYCLE_BASELINE = "pg3-revenue-lifecycle-v1" as const;

export const COMMERCIAL_HEALTH_STATUSES = [
  "HEALTHY",
  "WATCH",
  "AT_RISK",
  "CRITICAL",
] as const;
export type CommercialHealthStatus =
  (typeof COMMERCIAL_HEALTH_STATUSES)[number];

export const GROWTH_SIGNALS = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
] as const;
export type GrowthSignal = (typeof GROWTH_SIGNALS)[number];

export const RETENTION_SIGNALS = [
  "STRONG",
  "STABLE",
  "WEAK",
  "CRITICAL",
] as const;
export type RetentionSignal = (typeof RETENTION_SIGNALS)[number];

export const EXPANSION_READINESS = [
  "NOT_READY",
  "CANDIDATE",
  "READY",
  "IN_MOTION",
] as const;
export type ExpansionReadiness = (typeof EXPANSION_READINESS)[number];

export type CommercialHealthRecord = Readonly<{
  customerId: string;
  commercialHealth: CommercialHealthStatus;
  revenueStatus: RevenueStatus;
  growthSignal: GrowthSignal;
  retentionSignal: RetentionSignal;
  expansionReadiness: ExpansionReadiness;
  commercialStage: CommercialStage;
  sourceExpansionSignal: ExpansionSignal;
  ordinal: number;
}>;

export type CommercialHealthFoundation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_3_2_ID;
  capability: typeof COMMERCIAL_HEALTH_CAPABILITY;
  version: typeof COMMERCIAL_HEALTH_VERSION;
  baselineTag: typeof PG3_REVENUE_LIFECYCLE_BASELINE;
  parentPack: typeof PG_3_1_ID;
  parentVersion: typeof REVENUE_LIFECYCLE_REGISTRY_VERSION;
  parentBaseline: typeof PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE;
  records: readonly CommercialHealthRecord[];
  revenueLifecycleFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noLiveProbes: true;
    noDatabase: true;
    noUi: true;
    noBilling: true;
    additiveOnly: true;
  };
}>;

let cached: CommercialHealthFoundation | null = null;

function cloneFoundation(
  row: CommercialHealthFoundation,
): CommercialHealthFoundation {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CommercialHealthFoundation, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    records: row.records,
    revenueLifecycleFingerprint: row.revenueLifecycleFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CommercialHealthFoundation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function mapCommercialHealth(
  row: RevenueLifecycleRecord,
): CommercialHealthStatus {
  switch (row.commercialStage) {
    case "AT_RISK":
      return "CRITICAL";
    case "PIPELINE":
    case "TRIAL":
      return "WATCH";
    case "EXPANDING":
    case "RENEWING":
    case "PAID":
      return "HEALTHY";
    default:
      return "AT_RISK";
  }
}

function mapGrowthSignal(row: RevenueLifecycleRecord): GrowthSignal {
  switch (row.expansionSignal) {
    case "HIGH":
      return "HIGH";
    case "MEDIUM":
      return "MEDIUM";
    case "LOW":
      return "LOW";
    default:
      return "NONE";
  }
}

function mapRetentionSignal(row: RevenueLifecycleRecord): RetentionSignal {
  switch (row.commercialStage) {
    case "AT_RISK":
      return "CRITICAL";
    case "PIPELINE":
    case "TRIAL":
      return "WEAK";
    case "PAID":
      return "STABLE";
    case "RENEWING":
    case "EXPANDING":
      return "STRONG";
    default:
      return "WEAK";
  }
}

function mapExpansionReadiness(
  row: RevenueLifecycleRecord,
): ExpansionReadiness {
  switch (row.commercialStage) {
    case "EXPANDING":
      return "IN_MOTION";
    case "RENEWING":
      return "READY";
    case "PAID":
      return "CANDIDATE";
    default:
      return "NOT_READY";
  }
}

function deriveRecord(row: RevenueLifecycleRecord): CommercialHealthRecord {
  return {
    customerId: row.customerId,
    commercialHealth: mapCommercialHealth(row),
    revenueStatus: row.revenueStatus,
    growthSignal: mapGrowthSignal(row),
    retentionSignal: mapRetentionSignal(row),
    expansionReadiness: mapExpansionReadiness(row),
    commercialStage: row.commercialStage,
    sourceExpansionSignal: row.expansionSignal,
    ordinal: row.ordinal,
  };
}

function deriveFromRevenue(
  revenue: RevenueLifecycleRegistry,
): CommercialHealthFoundation {
  const withoutFp: Omit<CommercialHealthFoundation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_3_2_ID,
    capability: COMMERCIAL_HEALTH_CAPABILITY,
    version: COMMERCIAL_HEALTH_VERSION,
    baselineTag: PG3_REVENUE_LIFECYCLE_BASELINE,
    parentPack: PG_3_1_ID,
    parentVersion: REVENUE_LIFECYCLE_REGISTRY_VERSION,
    parentBaseline: PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE,
    records: revenue.records.map(deriveRecord),
    revenueLifecycleFingerprint: revenue.fingerprint,
    scope: {
      readOnly: true,
      noLiveProbes: true,
      noDatabase: true,
      noUi: true,
      noBilling: true,
      additiveOnly: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build commercial health from PG-3.1 revenue lifecycle. */
export function buildCommercialHealth(): CommercialHealthFoundation {
  const revenue = getRevenueLifecycleRegistry();
  const out = deriveFromRevenue(revenue);
  cached = cloneFoundation(out);
  return cloneFoundation(cached);
}

/** Get last built foundation, or build if none cached. */
export function getCommercialHealth(): CommercialHealthFoundation {
  if (!cached) {
    return buildCommercialHealth();
  }
  return cloneFoundation(cached);
}

/** Stable content fingerprint for determinism checks. */
export function commercialHealthFingerprint(
  row?: CommercialHealthFoundation,
): string {
  const v = row ?? getCommercialHealth();
  return v.fingerprint;
}

/** Test helper — clears commercial health cache only. */
export function clearCommercialHealth(): void {
  cached = null;
}

/** Ensure revenue lifecycle then build commercial health (verify scripts). */
export function ensureRevenueThenBuildCommercialHealth(): CommercialHealthFoundation {
  buildRevenueLifecycleRegistry();
  clearCommercialHealth();
  return buildCommercialHealth();
}
