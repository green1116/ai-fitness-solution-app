/**
 * PG-2.3 — Customer Activity Evidence
 * Read-only deterministic activity evidence contract (no live CRM activity store).
 * Baseline: pg2-2-adoption-health (derives from PG-2.2).
 * No DB / UI / billing / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import { RELEASE_ID } from "../release-readiness";
import {
  ADOPTION_HEALTH_VERSION,
  PG_2_2_ID,
  PG2_1_CUSTOMER_LIFECYCLE_BASELINE,
  buildAdoptionHealth,
  getAdoptionHealth,
  type AdoptionHealthFoundation,
  type AdoptionHealthRecord,
  type AdoptionHealthStatus,
} from "./adoption-health";
import type { CustomerLifecycleStage } from "./customer-lifecycle-registry";

export const PG_2_3_ID = "PG-2.3" as const;
export const CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY =
  "CustomerActivityEvidence" as const;
export const CUSTOMER_ACTIVITY_EVIDENCE_VERSION =
  "pg-2.3-customer-activity-evidence-1" as const;
/** PG-2.2 adoption health pack baseline. */
export const PG2_2_ADOPTION_HEALTH_BASELINE = "pg2-2-adoption-health" as const;

export const CUSTOMER_ACTIVITY_TYPES = [
  "LIFECYCLE_OBSERVED",
  "ADOPTION_SCORED",
  "USAGE_SIGNALED",
  "RISK_FLAGGED",
] as const;
export type CustomerActivityType = (typeof CUSTOMER_ACTIVITY_TYPES)[number];

export type CustomerActivitySource = Readonly<{
  actor: "system";
  source: "pg-2-customer-chain";
  capability: typeof CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY;
}>;

export type CustomerActivityEvidenceReference = Readonly<{
  adoptionHealthFingerprint: string;
  healthStatus: AdoptionHealthStatus;
  contractVersion: "pg-2.3-activity-evidence-1";
}>;

export type CustomerActivityLifecycleRelation = Readonly<{
  lifecycleStage: CustomerLifecycleStage;
  customerOrdinal: number;
  parentPack: typeof PG_2_2_ID;
}>;

export type CustomerActivityEvidenceRecord = Readonly<{
  customerId: string;
  activityId: string;
  activityType: CustomerActivityType;
  source: CustomerActivitySource;
  evidenceReference: CustomerActivityEvidenceReference;
  lifecycleRelation: CustomerActivityLifecycleRelation;
  ordinal: number;
}>;

export type CustomerActivityEvidenceFoundation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_2_3_ID;
  capability: typeof CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY;
  version: typeof CUSTOMER_ACTIVITY_EVIDENCE_VERSION;
  baselineTag: typeof PG2_2_ADOPTION_HEALTH_BASELINE;
  parentPack: typeof PG_2_2_ID;
  parentVersion: typeof ADOPTION_HEALTH_VERSION;
  parentBaseline: typeof PG2_1_CUSTOMER_LIFECYCLE_BASELINE;
  activities: readonly CustomerActivityEvidenceRecord[];
  adoptionHealthFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    noBilling: true;
    additiveOnly: true;
  };
}>;

let cached: CustomerActivityEvidenceFoundation | null = null;

function cloneFoundation(
  row: CustomerActivityEvidenceFoundation,
): CustomerActivityEvidenceFoundation {
  return {
    ...row,
    activities: row.activities.map((a) => ({
      ...a,
      source: { ...a.source },
      evidenceReference: { ...a.evidenceReference },
      lifecycleRelation: { ...a.lifecycleRelation },
    })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerActivityEvidenceFoundation, "fingerprint">,
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
    activities: row.activities,
    adoptionHealthFingerprint: row.adoptionHealthFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerActivityEvidenceFoundation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function activityTypesFor(
  row: AdoptionHealthRecord,
): readonly CustomerActivityType[] {
  const types: CustomerActivityType[] = [
    "LIFECYCLE_OBSERVED",
    "ADOPTION_SCORED",
    "USAGE_SIGNALED",
  ];
  if (row.riskSignal !== "NONE" || row.healthStatus === "CRITICAL") {
    types.push("RISK_FLAGGED");
  }
  return types;
}

function buildActivities(
  adoption: AdoptionHealthFoundation,
): CustomerActivityEvidenceRecord[] {
  const source: CustomerActivitySource = {
    actor: "system",
    source: "pg-2-customer-chain",
    capability: CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY,
  };
  const out: CustomerActivityEvidenceRecord[] = [];
  let ordinal = 0;

  for (const row of adoption.records) {
    for (const activityType of activityTypesFor(row)) {
      ordinal += 1;
      out.push({
        customerId: row.customerId,
        activityId: `act-pg23-${String(ordinal).padStart(2, "0")}-${activityType
          .toLowerCase()
          .replace(/_/g, "-")}`,
        activityType,
        source,
        evidenceReference: {
          adoptionHealthFingerprint: adoption.fingerprint,
          healthStatus: row.healthStatus,
          contractVersion: "pg-2.3-activity-evidence-1",
        },
        lifecycleRelation: {
          lifecycleStage: row.lifecycleStage,
          customerOrdinal: row.ordinal,
          parentPack: PG_2_2_ID,
        },
        ordinal,
      });
    }
  }

  return out;
}

function deriveFromAdoption(
  adoption: AdoptionHealthFoundation,
): CustomerActivityEvidenceFoundation {
  const withoutFp: Omit<CustomerActivityEvidenceFoundation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_2_3_ID,
    capability: CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY,
    version: CUSTOMER_ACTIVITY_EVIDENCE_VERSION,
    baselineTag: PG2_2_ADOPTION_HEALTH_BASELINE,
    parentPack: PG_2_2_ID,
    parentVersion: ADOPTION_HEALTH_VERSION,
    parentBaseline: PG2_1_CUSTOMER_LIFECYCLE_BASELINE,
    activities: buildActivities(adoption),
    adoptionHealthFingerprint: adoption.fingerprint,
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

/** Build activity evidence from PG-2.2 adoption health. */
export function buildCustomerActivityEvidence(): CustomerActivityEvidenceFoundation {
  const adoption = getAdoptionHealth();
  const out = deriveFromAdoption(adoption);
  cached = cloneFoundation(out);
  return cloneFoundation(cached);
}

/** Get last built foundation, or build if none cached. */
export function getCustomerActivityEvidence(): CustomerActivityEvidenceFoundation {
  if (!cached) {
    return buildCustomerActivityEvidence();
  }
  return cloneFoundation(cached);
}

/** Stable content fingerprint for determinism checks. */
export function customerActivityEvidenceFingerprint(
  row?: CustomerActivityEvidenceFoundation,
): string {
  const v = row ?? getCustomerActivityEvidence();
  return v.fingerprint;
}

/** Test helper — clears activity evidence cache only. */
export function clearCustomerActivityEvidence(): void {
  cached = null;
}

/** Ensure adoption health then build evidence (verify scripts). */
export function ensureAdoptionThenBuildActivityEvidence(): CustomerActivityEvidenceFoundation {
  buildAdoptionHealth();
  clearCustomerActivityEvidence();
  return buildCustomerActivityEvidence();
}
