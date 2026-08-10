/**
 * PG-2.2 — Adoption Health
 * Read-only deterministic adoption health contract (no live usage probes).
 * Baseline: pg2-1-customer-lifecycle (derives from PG-2.1).
 * No DB / UI / billing / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import { RELEASE_ID } from "../release-readiness";
import {
  CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
  PG_2_1_ID,
  PG1_FREEZE_BASELINE,
  buildCustomerLifecycleRegistry,
  getCustomerLifecycleRegistry,
  type AdoptionStatus,
  type CustomerLifecycleRecord,
  type CustomerLifecycleRegistry,
  type CustomerLifecycleStage,
} from "./customer-lifecycle-registry";

export const PG_2_2_ID = "PG-2.2" as const;
export const ADOPTION_HEALTH_CAPABILITY = "AdoptionHealth" as const;
export const ADOPTION_HEALTH_VERSION = "pg-2.2-adoption-health-1" as const;
/** PG-2.1 customer lifecycle pack baseline. */
export const PG2_1_CUSTOMER_LIFECYCLE_BASELINE =
  "pg2-1-customer-lifecycle" as const;

export const ADOPTION_LEVELS = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL_GAP",
] as const;
export type AdoptionLevel = (typeof ADOPTION_LEVELS)[number];

export const USAGE_SIGNALS = [
  "NONE",
  "LOW",
  "MODERATE",
  "HIGH",
  "DECLINING",
] as const;
export type UsageSignal = (typeof USAGE_SIGNALS)[number];

export const ADOPTION_HEALTH_STATUSES = [
  "HEALTHY",
  "WATCH",
  "AT_RISK",
  "CRITICAL",
] as const;
export type AdoptionHealthStatus = (typeof ADOPTION_HEALTH_STATUSES)[number];

export const ADOPTION_RISK_SIGNALS = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
] as const;
export type AdoptionRiskSignal = (typeof ADOPTION_RISK_SIGNALS)[number];

export type AdoptionHealthRecord = Readonly<{
  customerId: string;
  adoptionLevel: AdoptionLevel;
  usageSignal: UsageSignal;
  healthStatus: AdoptionHealthStatus;
  riskSignal: AdoptionRiskSignal;
  lifecycleStage: CustomerLifecycleStage;
  sourceAdoptionStatus: AdoptionStatus;
  ordinal: number;
}>;

export type AdoptionHealthFoundation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_2_2_ID;
  capability: typeof ADOPTION_HEALTH_CAPABILITY;
  version: typeof ADOPTION_HEALTH_VERSION;
  baselineTag: typeof PG2_1_CUSTOMER_LIFECYCLE_BASELINE;
  parentPack: typeof PG_2_1_ID;
  parentVersion: typeof CUSTOMER_LIFECYCLE_REGISTRY_VERSION;
  parentBaseline: typeof PG1_FREEZE_BASELINE;
  records: readonly AdoptionHealthRecord[];
  lifecycleFingerprint: string;
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

let cached: AdoptionHealthFoundation | null = null;

function cloneFoundation(
  row: AdoptionHealthFoundation,
): AdoptionHealthFoundation {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<AdoptionHealthFoundation, "fingerprint">,
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
    lifecycleFingerprint: row.lifecycleFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<AdoptionHealthFoundation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function mapAdoptionLevel(row: CustomerLifecycleRecord): AdoptionLevel {
  if (row.lifecycleStage === "CHURN_RISK") return "CRITICAL_GAP";
  switch (row.adoptionStatus) {
    case "NONE":
      return "NONE";
    case "EARLY":
      return "LOW";
    case "ESTABLISHED":
      return "MEDIUM";
    case "EXPANDED":
      return "HIGH";
    default:
      return "NONE";
  }
}

function mapUsageSignal(row: CustomerLifecycleRecord): UsageSignal {
  if (row.lifecycleStage === "CHURN_RISK") return "DECLINING";
  if (row.lifecycleStage === "PROSPECT") return "NONE";
  if (row.lifecycleStage === "ONBOARDING") return "LOW";
  if (row.lifecycleStage === "EXPANSION") return "HIGH";
  if (row.adoptionStatus === "ESTABLISHED") return "MODERATE";
  if (row.adoptionStatus === "EARLY") return "LOW";
  if (row.adoptionStatus === "EXPANDED") return "HIGH";
  return "NONE";
}

function mapHealthStatus(row: CustomerLifecycleRecord): AdoptionHealthStatus {
  if (row.lifecycleStage === "CHURN_RISK") return "CRITICAL";
  if (row.lifecycleStage === "PROSPECT") return "WATCH";
  if (row.lifecycleStage === "ONBOARDING") return "WATCH";
  if (row.lifecycleStage === "EXPANSION") return "HEALTHY";
  if (row.adoptionStatus === "ESTABLISHED") return "HEALTHY";
  if (row.adoptionStatus === "EARLY") return "WATCH";
  return "AT_RISK";
}

function mapRiskSignal(row: CustomerLifecycleRecord): AdoptionRiskSignal {
  if (row.lifecycleStage === "CHURN_RISK") return "HIGH";
  if (row.lifecycleStage === "PROSPECT") return "MEDIUM";
  if (row.lifecycleStage === "ONBOARDING") return "LOW";
  if (row.adoptionStatus === "EARLY") return "LOW";
  return "NONE";
}

function deriveRecord(
  row: CustomerLifecycleRecord,
): AdoptionHealthRecord {
  return {
    customerId: row.customerId,
    adoptionLevel: mapAdoptionLevel(row),
    usageSignal: mapUsageSignal(row),
    healthStatus: mapHealthStatus(row),
    riskSignal: mapRiskSignal(row),
    lifecycleStage: row.lifecycleStage,
    sourceAdoptionStatus: row.adoptionStatus,
    ordinal: row.ordinal,
  };
}

function deriveFromLifecycle(
  lifecycle: CustomerLifecycleRegistry,
): AdoptionHealthFoundation {
  const withoutFp: Omit<AdoptionHealthFoundation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_2_2_ID,
    capability: ADOPTION_HEALTH_CAPABILITY,
    version: ADOPTION_HEALTH_VERSION,
    baselineTag: PG2_1_CUSTOMER_LIFECYCLE_BASELINE,
    parentPack: PG_2_1_ID,
    parentVersion: CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
    parentBaseline: PG1_FREEZE_BASELINE,
    records: lifecycle.customers.map(deriveRecord),
    lifecycleFingerprint: lifecycle.fingerprint,
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

/** Build adoption health from PG-2.1 customer lifecycle. */
export function buildAdoptionHealth(): AdoptionHealthFoundation {
  const lifecycle = getCustomerLifecycleRegistry();
  const out = deriveFromLifecycle(lifecycle);
  cached = cloneFoundation(out);
  return cloneFoundation(cached);
}

/** Get last built foundation, or build if none cached. */
export function getAdoptionHealth(): AdoptionHealthFoundation {
  if (!cached) {
    return buildAdoptionHealth();
  }
  return cloneFoundation(cached);
}

/** Stable content fingerprint for determinism checks. */
export function adoptionHealthFingerprint(
  row?: AdoptionHealthFoundation,
): string {
  const v = row ?? getAdoptionHealth();
  return v.fingerprint;
}

/** Test helper — clears adoption health cache only. */
export function clearAdoptionHealth(): void {
  cached = null;
}

/** Ensure lifecycle then build adoption health (verify scripts). */
export function ensureLifecycleThenBuildAdoptionHealth(): AdoptionHealthFoundation {
  buildCustomerLifecycleRegistry();
  clearAdoptionHealth();
  return buildAdoptionHealth();
}
