/**
 * PG-2.1 — Customer Lifecycle Registry
 * Read-only deterministic customer lifecycle contract (no CRM/DB writes).
 * Baseline: pg1-freeze (derives from PG-1 Freeze).
 * No DB / UI / billing / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import { RELEASE_ID } from "../release-readiness";
import {
  PG_1_FREEZE_ID,
  PG_1_FREEZE_VERSION,
  PG1_PRODUCTION_AUDIT_BASELINE,
  buildPg1FreezeManifest,
  getPg1FreezeManifest,
  type Pg1FreezeManifest,
} from "../health/pg1-freeze-manifest";

export const PG_2_1_ID = "PG-2.1" as const;
export const CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY =
  "CustomerLifecycleRegistry" as const;
export const CUSTOMER_LIFECYCLE_REGISTRY_VERSION =
  "pg-2.1-customer-lifecycle-registry-1" as const;
/** PG-1 operations freeze pack baseline. */
export const PG1_FREEZE_BASELINE = "pg1-freeze" as const;

export const CUSTOMER_LIFECYCLE_STAGES = [
  "PROSPECT",
  "ONBOARDING",
  "ACTIVE",
  "ADOPTING",
  "EXPANSION",
  "CHURN_RISK",
] as const;
export type CustomerLifecycleStage =
  (typeof CUSTOMER_LIFECYCLE_STAGES)[number];

export const ONBOARDING_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETE",
] as const;
export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export const ACTIVATION_STATUSES = [
  "INACTIVE",
  "PENDING",
  "ACTIVATED",
] as const;
export type ActivationStatus = (typeof ACTIVATION_STATUSES)[number];

export const ADOPTION_STATUSES = [
  "NONE",
  "EARLY",
  "ESTABLISHED",
  "EXPANDED",
] as const;
export type AdoptionStatus = (typeof ADOPTION_STATUSES)[number];

export type CustomerLifecycleRecord = Readonly<{
  customerId: string;
  lifecycleStage: CustomerLifecycleStage;
  onboardingStatus: OnboardingStatus;
  activationStatus: ActivationStatus;
  adoptionStatus: AdoptionStatus;
  ordinal: number;
}>;

export type CustomerLifecycleRegistry = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_2_1_ID;
  capability: typeof CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY;
  version: typeof CUSTOMER_LIFECYCLE_REGISTRY_VERSION;
  baselineTag: typeof PG1_FREEZE_BASELINE;
  parentPack: typeof PG_1_FREEZE_ID;
  parentVersion: typeof PG_1_FREEZE_VERSION;
  parentBaseline: typeof PG1_PRODUCTION_AUDIT_BASELINE;
  customers: readonly CustomerLifecycleRecord[];
  pg1FreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    noBilling: true;
    additiveOnly: true;
  };
}>;

type SeedDef = Readonly<{
  customerIdSuffix: string;
  lifecycleStage: CustomerLifecycleStage;
  onboardingStatus: OnboardingStatus;
  activationStatus: ActivationStatus;
  adoptionStatus: AdoptionStatus;
}>;

/** Deterministic seed templates — not persisted to CRM/DB. */
const CUSTOMER_LIFECYCLE_SEEDS: readonly SeedDef[] = [
  {
    customerIdSuffix: "prospect-01",
    lifecycleStage: "PROSPECT",
    onboardingStatus: "NOT_STARTED",
    activationStatus: "INACTIVE",
    adoptionStatus: "NONE",
  },
  {
    customerIdSuffix: "onboarding-01",
    lifecycleStage: "ONBOARDING",
    onboardingStatus: "IN_PROGRESS",
    activationStatus: "PENDING",
    adoptionStatus: "NONE",
  },
  {
    customerIdSuffix: "active-01",
    lifecycleStage: "ACTIVE",
    onboardingStatus: "COMPLETE",
    activationStatus: "ACTIVATED",
    adoptionStatus: "EARLY",
  },
  {
    customerIdSuffix: "adopting-01",
    lifecycleStage: "ADOPTING",
    onboardingStatus: "COMPLETE",
    activationStatus: "ACTIVATED",
    adoptionStatus: "ESTABLISHED",
  },
  {
    customerIdSuffix: "expansion-01",
    lifecycleStage: "EXPANSION",
    onboardingStatus: "COMPLETE",
    activationStatus: "ACTIVATED",
    adoptionStatus: "EXPANDED",
  },
  {
    customerIdSuffix: "churn-risk-01",
    lifecycleStage: "CHURN_RISK",
    onboardingStatus: "COMPLETE",
    activationStatus: "ACTIVATED",
    adoptionStatus: "EARLY",
  },
] as const;

let cached: CustomerLifecycleRegistry | null = null;

function cloneRegistry(
  row: CustomerLifecycleRegistry,
): CustomerLifecycleRegistry {
  return {
    ...row,
    customers: row.customers.map((c) => ({ ...c })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerLifecycleRegistry, "fingerprint">,
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
    customers: row.customers,
    pg1FreezeFingerprint: row.pg1FreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerLifecycleRegistry, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildCustomers(): CustomerLifecycleRecord[] {
  return CUSTOMER_LIFECYCLE_SEEDS.map((seed, index) => ({
    customerId: `cust-pg21-${seed.customerIdSuffix}`,
    lifecycleStage: seed.lifecycleStage,
    onboardingStatus: seed.onboardingStatus,
    activationStatus: seed.activationStatus,
    adoptionStatus: seed.adoptionStatus,
    ordinal: index + 1,
  }));
}

function deriveFromFreeze(
  freeze: Pg1FreezeManifest,
): CustomerLifecycleRegistry {
  const withoutFp: Omit<CustomerLifecycleRegistry, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_2_1_ID,
    capability: CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY,
    version: CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
    baselineTag: PG1_FREEZE_BASELINE,
    parentPack: PG_1_FREEZE_ID,
    parentVersion: PG_1_FREEZE_VERSION,
    parentBaseline: PG1_PRODUCTION_AUDIT_BASELINE,
    customers: buildCustomers(),
    pg1FreezeFingerprint: freeze.fingerprint,
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

/** Build customer lifecycle registry from PG-1 freeze. */
export function buildCustomerLifecycleRegistry(): CustomerLifecycleRegistry {
  const freeze = getPg1FreezeManifest();
  const out = deriveFromFreeze(freeze);
  cached = cloneRegistry(out);
  return cloneRegistry(cached);
}

/** Get last built registry, or build if none cached. */
export function getCustomerLifecycleRegistry(): CustomerLifecycleRegistry {
  if (!cached) {
    return buildCustomerLifecycleRegistry();
  }
  return cloneRegistry(cached);
}

/** Stable content fingerprint for determinism checks. */
export function customerLifecycleRegistryFingerprint(
  row?: CustomerLifecycleRegistry,
): string {
  const v = row ?? getCustomerLifecycleRegistry();
  return v.fingerprint;
}

/** Test helper — clears customer lifecycle cache only. */
export function clearCustomerLifecycleRegistry(): void {
  cached = null;
}

/** Ensure PG-1 freeze then build registry (verify scripts). */
export function ensurePg1FreezeThenBuildCustomerLifecycle(): CustomerLifecycleRegistry {
  buildPg1FreezeManifest();
  clearCustomerLifecycleRegistry();
  return buildCustomerLifecycleRegistry();
}
