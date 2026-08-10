/**
 * PG-2 Freeze — Immutable Customer Adoption Baseline
 * Freezes PG-2.1~PG-2.3 lifecycle/adoption/activity foundations.
 * Baseline: pg2-customer-activity-evidence-v1.
 * No DB / UI / redesign / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../ga-release";
import {
  PG_1_FREEZE_ID,
  PG_1_FREEZE_VERSION,
} from "../health/pg1-freeze-manifest";
import {
  RELEASE_HEALTH_COMMIT_REF,
  getReleaseHealthRegistry,
  type ReleaseHealthRollbackReference,
} from "../health/release-health-registry";
import { RELEASE_ID } from "../release-readiness";
import {
  ADOPTION_HEALTH_CAPABILITY,
  ADOPTION_HEALTH_VERSION,
  PG_2_2_ID,
  PG2_1_CUSTOMER_LIFECYCLE_BASELINE,
} from "./adoption-health";
import {
  CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY,
  CUSTOMER_ACTIVITY_EVIDENCE_VERSION,
  PG_2_3_ID,
  PG2_2_ADOPTION_HEALTH_BASELINE,
  buildCustomerActivityEvidence,
  getCustomerActivityEvidence,
  type CustomerActivityEvidenceFoundation,
} from "./customer-activity-evidence";
import {
  CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY,
  CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
  PG_2_1_ID,
  PG1_FREEZE_BASELINE,
} from "./customer-lifecycle-registry";

export const PG_2_FREEZE_ID = "PG-2-Freeze" as const;
export const PG_2_FREEZE_CAPABILITY = "Pg2CustomerAdoptionFreeze" as const;
export const PG_2_FREEZE_VERSION = "pg-2-freeze-1.0.0" as const;
export const PG_2_FREEZE_CODENAME =
  "PG-2 Customer Adoption Baseline Freeze" as const;
export const PG_2_FREEZE_DATE = "2026-08-10" as const;
/** PG-2.3 customer activity evidence pack baseline. */
export const PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE =
  "pg2-customer-activity-evidence-v1" as const;

export type Pg2ComponentStatus = "frozen";

export type Pg2ComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: Pg2ComponentStatus;
}>;

export type Pg2VersionReferences = Readonly<{
  freezeVersion: typeof PG_2_FREEZE_VERSION;
  baselineTag: typeof PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  parentFreeze: typeof PG_1_FREEZE_VERSION;
  parentFreezeId: typeof PG_1_FREEZE_ID;
  components: {
    "PG-2.1": typeof CUSTOMER_LIFECYCLE_REGISTRY_VERSION;
    "PG-2.2": typeof ADOPTION_HEALTH_VERSION;
    "PG-2.3": typeof CUSTOMER_ACTIVITY_EVIDENCE_VERSION;
  };
}>;

export type Pg2VerificationSummary = Readonly<{
  status: "PASS" | "FAIL";
  componentCount: number;
  customerCount: number;
  activityCount: number;
  activityFingerprint: string;
  certified: boolean;
}>;

export type Pg2FreezeManifest = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_2_FREEZE_ID;
  capability: typeof PG_2_FREEZE_CAPABILITY;
  version: typeof PG_2_FREEZE_VERSION;
  codename: typeof PG_2_FREEZE_CODENAME;
  freezeDate: typeof PG_2_FREEZE_DATE;
  baselineTag: typeof PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE;
  components: readonly Pg2ComponentEntry[];
  versionReferences: Pg2VersionReferences;
  verificationSummary: Pg2VerificationSummary;
  rollbackReference: ReleaseHealthRollbackReference;
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "PG-2.1~PG-2.3";
    closure: "PG-2-Freeze";
    immutable: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
  };
}>;

export const PG_2_COMPONENTS: readonly Pg2ComponentEntry[] = [
  {
    id: PG_2_1_ID,
    name: "Customer Lifecycle Registry",
    capability: CUSTOMER_LIFECYCLE_REGISTRY_CAPABILITY,
    version: CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
    baselineTag: PG1_FREEZE_BASELINE,
    modulePath: "lib/release/customer/customer-lifecycle-registry.ts",
    verifyScript: "scripts/verify-pg-2-1-customer-lifecycle.ts",
    buildApi: "buildCustomerLifecycleRegistry",
    status: "frozen",
  },
  {
    id: PG_2_2_ID,
    name: "Adoption Health",
    capability: ADOPTION_HEALTH_CAPABILITY,
    version: ADOPTION_HEALTH_VERSION,
    baselineTag: PG2_1_CUSTOMER_LIFECYCLE_BASELINE,
    modulePath: "lib/release/customer/adoption-health.ts",
    verifyScript: "scripts/verify-pg-2-2-adoption-health.ts",
    buildApi: "buildAdoptionHealth",
    status: "frozen",
  },
  {
    id: PG_2_3_ID,
    name: "Customer Activity Evidence",
    capability: CUSTOMER_ACTIVITY_EVIDENCE_CAPABILITY,
    version: CUSTOMER_ACTIVITY_EVIDENCE_VERSION,
    baselineTag: PG2_2_ADOPTION_HEALTH_BASELINE,
    modulePath: "lib/release/customer/customer-activity-evidence.ts",
    verifyScript: "scripts/verify-pg-2-3-customer-activity-evidence.ts",
    buildApi: "buildCustomerActivityEvidence",
    status: "frozen",
  },
] as const;

let cached: Pg2FreezeManifest | null = null;

function cloneManifest(row: Pg2FreezeManifest): Pg2FreezeManifest {
  return {
    ...row,
    components: row.components.map((c) => ({ ...c })),
    versionReferences: {
      ...row.versionReferences,
      components: { ...row.versionReferences.components },
    },
    verificationSummary: { ...row.verificationSummary },
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<Pg2FreezeManifest, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    components: row.components,
    versionReferences: row.versionReferences,
    verificationSummary: row.verificationSummary,
    rollbackReference: row.rollbackReference,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<Pg2FreezeManifest, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFromActivity(
  activity: CustomerActivityEvidenceFoundation,
): Pg2FreezeManifest {
  const health = getReleaseHealthRegistry();
  const customerIds = new Set(activity.activities.map((a) => a.customerId));
  const pass =
    activity.activities.length > 0 &&
    customerIds.size > 0 &&
    health.verificationStatus === "PASS" &&
    health.rollbackReference.ready === true &&
    PG_2_COMPONENTS.every((c) => c.status === "frozen") &&
    activity.baselineTag === PG2_2_ADOPTION_HEALTH_BASELINE;

  const withoutFp: Omit<Pg2FreezeManifest, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_2_FREEZE_ID,
    capability: PG_2_FREEZE_CAPABILITY,
    version: PG_2_FREEZE_VERSION,
    codename: PG_2_FREEZE_CODENAME,
    freezeDate: PG_2_FREEZE_DATE,
    baselineTag: PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE,
    components: PG_2_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: PG_2_FREEZE_VERSION,
      baselineTag: PG2_CUSTOMER_ACTIVITY_EVIDENCE_BASELINE,
      gaVersion: GA_RELEASE_VERSION,
      gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
      gaBaseline: GA_RELEASE_BASELINE,
      commitReference: RELEASE_HEALTH_COMMIT_REF,
      parentFreeze: PG_1_FREEZE_VERSION,
      parentFreezeId: PG_1_FREEZE_ID,
      components: {
        "PG-2.1": CUSTOMER_LIFECYCLE_REGISTRY_VERSION,
        "PG-2.2": ADOPTION_HEALTH_VERSION,
        "PG-2.3": CUSTOMER_ACTIVITY_EVIDENCE_VERSION,
      },
    },
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: PG_2_COMPONENTS.length,
      customerCount: customerIds.size,
      activityCount: activity.activities.length,
      activityFingerprint: activity.fingerprint,
      certified: pass,
    },
    rollbackReference: {
      ...health.rollbackReference,
      restoreTargets: [...health.rollbackReference.restoreTargets],
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "PG-2.1~PG-2.3",
      closure: "PG-2-Freeze",
      immutable: true,
      readOnly: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build immutable PG-2 freeze manifest from PG-2.3 activity evidence. */
export function buildPg2FreezeManifest(): Pg2FreezeManifest {
  const activity = getCustomerActivityEvidence();
  const out = deriveFromActivity(activity);
  cached = cloneManifest(out);
  return cloneManifest(cached);
}

/** Get last built freeze, or build if none cached. */
export function getPg2FreezeManifest(): Pg2FreezeManifest {
  if (!cached) {
    return buildPg2FreezeManifest();
  }
  return cloneManifest(cached);
}

/** Stable content fingerprint for determinism checks. */
export function pg2FreezeManifestFingerprint(row?: Pg2FreezeManifest): string {
  const v = row ?? getPg2FreezeManifest();
  return v.fingerprint;
}

/** Test helper — clears PG-2 freeze cache only. */
export function clearPg2FreezeManifest(): void {
  cached = null;
}

/** Ensure activity evidence then build freeze (verify scripts). */
export function ensureActivityThenBuildPg2Freeze(): Pg2FreezeManifest {
  buildCustomerActivityEvidence();
  clearPg2FreezeManifest();
  return buildPg2FreezeManifest();
}
