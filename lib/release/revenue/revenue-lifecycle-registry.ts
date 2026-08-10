/**
 * PG-3.1 — Revenue Lifecycle Registry
 * Read-only deterministic revenue lifecycle contract (no billing/DB writes).
 * Baseline: pg2-customer-adoption-freeze-v1 (derives from PG-2 Freeze).
 * No DB / UI / billing / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import { RELEASE_ID } from "../release-readiness";
import {
  getCustomerLifecycleRegistry,
  type CustomerLifecycleRecord,
  type CustomerLifecycleStage,
} from "../customer/customer-lifecycle-registry";
import {
  PG_2_FREEZE_ID,
  PG_2_FREEZE_VERSION,
  PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE,
  buildPg2FreezeManifest,
  getPg2FreezeManifest,
  type Pg2FreezeManifest,
} from "../customer/pg2-freeze-manifest";

export const PG_3_1_ID = "PG-3.1" as const;
export const REVENUE_LIFECYCLE_REGISTRY_CAPABILITY =
  "RevenueLifecycleRegistry" as const;
export const REVENUE_LIFECYCLE_REGISTRY_VERSION =
  "pg-3.1-revenue-lifecycle-registry-1" as const;
/** PG-2 customer adoption freeze pack baseline. */
export const PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE =
  "pg2-customer-adoption-freeze-v1" as const;

export const COMMERCIAL_STAGES = [
  "PIPELINE",
  "TRIAL",
  "PAID",
  "RENEWING",
  "EXPANDING",
  "AT_RISK",
] as const;
export type CommercialStage = (typeof COMMERCIAL_STAGES)[number];

export const SUBSCRIPTION_STATES = [
  "NONE",
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
] as const;
export type SubscriptionState = (typeof SUBSCRIPTION_STATES)[number];

export const REVENUE_STATUSES = [
  "NONE",
  "PENDING",
  "RECOGNIZED",
  "EXPANDED",
  "CHURNING",
] as const;
export type RevenueStatus = (typeof REVENUE_STATUSES)[number];

export const EXPANSION_SIGNALS = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
] as const;
export type ExpansionSignal = (typeof EXPANSION_SIGNALS)[number];

export type RevenueLifecycleRecord = Readonly<{
  customerId: string;
  commercialStage: CommercialStage;
  subscriptionState: SubscriptionState;
  revenueStatus: RevenueStatus;
  expansionSignal: ExpansionSignal;
  lifecycleStage: CustomerLifecycleStage;
  ordinal: number;
}>;

export type RevenueLifecycleRegistry = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_3_1_ID;
  capability: typeof REVENUE_LIFECYCLE_REGISTRY_CAPABILITY;
  version: typeof REVENUE_LIFECYCLE_REGISTRY_VERSION;
  baselineTag: typeof PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE;
  parentPack: typeof PG_2_FREEZE_ID;
  parentVersion: typeof PG_2_FREEZE_VERSION;
  parentBaseline: typeof PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE;
  records: readonly RevenueLifecycleRecord[];
  pg2FreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    noBilling: true;
    additiveOnly: true;
  };
}>;

let cached: RevenueLifecycleRegistry | null = null;

function cloneRegistry(
  row: RevenueLifecycleRegistry,
): RevenueLifecycleRegistry {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<RevenueLifecycleRegistry, "fingerprint">,
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
    pg2FreezeFingerprint: row.pg2FreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RevenueLifecycleRegistry, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function mapCommercialStage(stage: CustomerLifecycleStage): CommercialStage {
  switch (stage) {
    case "PROSPECT":
      return "PIPELINE";
    case "ONBOARDING":
      return "TRIAL";
    case "ACTIVE":
      return "PAID";
    case "ADOPTING":
      return "RENEWING";
    case "EXPANSION":
      return "EXPANDING";
    case "CHURN_RISK":
      return "AT_RISK";
    default:
      return "PIPELINE";
  }
}

function mapSubscriptionState(stage: CustomerLifecycleStage): SubscriptionState {
  switch (stage) {
    case "PROSPECT":
      return "NONE";
    case "ONBOARDING":
      return "TRIALING";
    case "ACTIVE":
    case "ADOPTING":
    case "EXPANSION":
      return "ACTIVE";
    case "CHURN_RISK":
      return "PAST_DUE";
    default:
      return "NONE";
  }
}

function mapRevenueStatus(stage: CustomerLifecycleStage): RevenueStatus {
  switch (stage) {
    case "PROSPECT":
      return "NONE";
    case "ONBOARDING":
      return "PENDING";
    case "ACTIVE":
    case "ADOPTING":
      return "RECOGNIZED";
    case "EXPANSION":
      return "EXPANDED";
    case "CHURN_RISK":
      return "CHURNING";
    default:
      return "NONE";
  }
}

function mapExpansionSignal(stage: CustomerLifecycleStage): ExpansionSignal {
  switch (stage) {
    case "EXPANSION":
      return "HIGH";
    case "ADOPTING":
      return "MEDIUM";
    case "ACTIVE":
      return "LOW";
    default:
      return "NONE";
  }
}

function deriveRecord(row: CustomerLifecycleRecord): RevenueLifecycleRecord {
  return {
    customerId: row.customerId,
    commercialStage: mapCommercialStage(row.lifecycleStage),
    subscriptionState: mapSubscriptionState(row.lifecycleStage),
    revenueStatus: mapRevenueStatus(row.lifecycleStage),
    expansionSignal: mapExpansionSignal(row.lifecycleStage),
    lifecycleStage: row.lifecycleStage,
    ordinal: row.ordinal,
  };
}

function deriveFromFreeze(
  freeze: Pg2FreezeManifest,
): RevenueLifecycleRegistry {
  const lifecycle = getCustomerLifecycleRegistry();
  const withoutFp: Omit<RevenueLifecycleRegistry, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_3_1_ID,
    capability: REVENUE_LIFECYCLE_REGISTRY_CAPABILITY,
    version: REVENUE_LIFECYCLE_REGISTRY_VERSION,
    baselineTag: PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE,
    parentPack: PG_2_FREEZE_ID,
    parentVersion: PG_2_FREEZE_VERSION,
    parentBaseline: PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE,
    records: lifecycle.customers.map(deriveRecord),
    pg2FreezeFingerprint: freeze.fingerprint,
    scope: {
      readOnly: true,
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

/** Build revenue lifecycle registry from PG-2 freeze. */
export function buildRevenueLifecycleRegistry(): RevenueLifecycleRegistry {
  const freeze = getPg2FreezeManifest();
  const out = deriveFromFreeze(freeze);
  cached = cloneRegistry(out);
  return cloneRegistry(cached);
}

/** Get last built registry, or build if none cached. */
export function getRevenueLifecycleRegistry(): RevenueLifecycleRegistry {
  if (!cached) {
    return buildRevenueLifecycleRegistry();
  }
  return cloneRegistry(cached);
}

/** Stable content fingerprint for determinism checks. */
export function revenueLifecycleRegistryFingerprint(
  row?: RevenueLifecycleRegistry,
): string {
  const v = row ?? getRevenueLifecycleRegistry();
  return v.fingerprint;
}

/** Test helper — clears revenue lifecycle cache only. */
export function clearRevenueLifecycleRegistry(): void {
  cached = null;
}

/** Ensure PG-2 freeze then build registry (verify scripts). */
export function ensurePg2FreezeThenBuildRevenueLifecycle(): RevenueLifecycleRegistry {
  buildPg2FreezeManifest();
  clearRevenueLifecycleRegistry();
  return buildRevenueLifecycleRegistry();
}
