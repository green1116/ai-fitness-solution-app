/**
 * PG-3 Freeze — Immutable Commercial Growth Baseline
 * Freezes PG-3.1~PG-3.3 revenue/commercial/growth foundations.
 * Baseline: pg3-growth-evidence-v1.
 * No DB / UI / redesign / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../ga-release";
import {
  PG_2_FREEZE_ID,
  PG_2_FREEZE_VERSION,
} from "../customer/pg2-freeze-manifest";
import {
  RELEASE_HEALTH_COMMIT_REF,
  getReleaseHealthRegistry,
  type ReleaseHealthRollbackReference,
} from "../health/release-health-registry";
import { RELEASE_ID } from "../release-readiness";
import {
  COMMERCIAL_HEALTH_CAPABILITY,
  COMMERCIAL_HEALTH_VERSION,
  PG_3_2_ID,
  PG3_REVENUE_LIFECYCLE_BASELINE,
} from "./commercial-health";
import {
  GROWTH_EVIDENCE_CAPABILITY,
  GROWTH_EVIDENCE_VERSION,
  PG_3_3_ID,
  PG3_COMMERCIAL_HEALTH_BASELINE,
  buildGrowthEvidence,
  getGrowthEvidence,
  type GrowthEvidenceFoundation,
} from "./growth-evidence";
import {
  PG_3_1_ID,
  PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE,
  REVENUE_LIFECYCLE_REGISTRY_CAPABILITY,
  REVENUE_LIFECYCLE_REGISTRY_VERSION,
} from "./revenue-lifecycle-registry";

export const PG_3_FREEZE_ID = "PG-3-Freeze" as const;
export const PG_3_FREEZE_CAPABILITY = "Pg3CommercialGrowthFreeze" as const;
export const PG_3_FREEZE_VERSION = "pg-3-freeze-1.0.0" as const;
export const PG_3_FREEZE_CODENAME =
  "PG-3 Commercial Growth Baseline Freeze" as const;
export const PG_3_FREEZE_DATE = "2026-08-10" as const;
/** PG-3.3 growth evidence pack baseline. */
export const PG3_GROWTH_EVIDENCE_BASELINE = "pg3-growth-evidence-v1" as const;

export type Pg3ComponentStatus = "frozen";

export type Pg3ComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: Pg3ComponentStatus;
}>;

export type Pg3VersionReferences = Readonly<{
  freezeVersion: typeof PG_3_FREEZE_VERSION;
  baselineTag: typeof PG3_GROWTH_EVIDENCE_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  parentFreeze: typeof PG_2_FREEZE_VERSION;
  parentFreezeId: typeof PG_2_FREEZE_ID;
  components: {
    "PG-3.1": typeof REVENUE_LIFECYCLE_REGISTRY_VERSION;
    "PG-3.2": typeof COMMERCIAL_HEALTH_VERSION;
    "PG-3.3": typeof GROWTH_EVIDENCE_VERSION;
  };
}>;

export type Pg3VerificationSummary = Readonly<{
  status: "PASS" | "FAIL";
  componentCount: number;
  customerCount: number;
  growthEventCount: number;
  growthFingerprint: string;
  certified: boolean;
}>;

export type Pg3FreezeManifest = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_3_FREEZE_ID;
  capability: typeof PG_3_FREEZE_CAPABILITY;
  version: typeof PG_3_FREEZE_VERSION;
  codename: typeof PG_3_FREEZE_CODENAME;
  freezeDate: typeof PG_3_FREEZE_DATE;
  baselineTag: typeof PG3_GROWTH_EVIDENCE_BASELINE;
  components: readonly Pg3ComponentEntry[];
  versionReferences: Pg3VersionReferences;
  verificationSummary: Pg3VerificationSummary;
  rollbackReference: ReleaseHealthRollbackReference;
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "PG-3.1~PG-3.3";
    closure: "PG-3-Freeze";
    immutable: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
  };
}>;

export const PG_3_COMPONENTS: readonly Pg3ComponentEntry[] = [
  {
    id: PG_3_1_ID,
    name: "Revenue Lifecycle Registry",
    capability: REVENUE_LIFECYCLE_REGISTRY_CAPABILITY,
    version: REVENUE_LIFECYCLE_REGISTRY_VERSION,
    baselineTag: PG2_CUSTOMER_ADOPTION_FREEZE_BASELINE,
    modulePath: "lib/release/revenue/revenue-lifecycle-registry.ts",
    verifyScript: "scripts/verify-pg-3-1-revenue-lifecycle.ts",
    buildApi: "buildRevenueLifecycleRegistry",
    status: "frozen",
  },
  {
    id: PG_3_2_ID,
    name: "Commercial Health",
    capability: COMMERCIAL_HEALTH_CAPABILITY,
    version: COMMERCIAL_HEALTH_VERSION,
    baselineTag: PG3_REVENUE_LIFECYCLE_BASELINE,
    modulePath: "lib/release/revenue/commercial-health.ts",
    verifyScript: "scripts/verify-pg-3-2-commercial-health.ts",
    buildApi: "buildCommercialHealth",
    status: "frozen",
  },
  {
    id: PG_3_3_ID,
    name: "Growth Evidence",
    capability: GROWTH_EVIDENCE_CAPABILITY,
    version: GROWTH_EVIDENCE_VERSION,
    baselineTag: PG3_COMMERCIAL_HEALTH_BASELINE,
    modulePath: "lib/release/revenue/growth-evidence.ts",
    verifyScript: "scripts/verify-pg-3-3-growth-evidence.ts",
    buildApi: "buildGrowthEvidence",
    status: "frozen",
  },
] as const;

let cached: Pg3FreezeManifest | null = null;

function cloneManifest(row: Pg3FreezeManifest): Pg3FreezeManifest {
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

function stablePayload(row: Omit<Pg3FreezeManifest, "fingerprint">): string {
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
  row: Omit<Pg3FreezeManifest, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFromGrowth(
  growth: GrowthEvidenceFoundation,
): Pg3FreezeManifest {
  const health = getReleaseHealthRegistry();
  const customerIds = new Set(growth.events.map((e) => e.customerId));
  const pass =
    growth.events.length > 0 &&
    customerIds.size > 0 &&
    health.verificationStatus === "PASS" &&
    health.rollbackReference.ready === true &&
    PG_3_COMPONENTS.every((c) => c.status === "frozen") &&
    growth.baselineTag === PG3_COMMERCIAL_HEALTH_BASELINE;

  const withoutFp: Omit<Pg3FreezeManifest, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_3_FREEZE_ID,
    capability: PG_3_FREEZE_CAPABILITY,
    version: PG_3_FREEZE_VERSION,
    codename: PG_3_FREEZE_CODENAME,
    freezeDate: PG_3_FREEZE_DATE,
    baselineTag: PG3_GROWTH_EVIDENCE_BASELINE,
    components: PG_3_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: PG_3_FREEZE_VERSION,
      baselineTag: PG3_GROWTH_EVIDENCE_BASELINE,
      gaVersion: GA_RELEASE_VERSION,
      gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
      gaBaseline: GA_RELEASE_BASELINE,
      commitReference: RELEASE_HEALTH_COMMIT_REF,
      parentFreeze: PG_2_FREEZE_VERSION,
      parentFreezeId: PG_2_FREEZE_ID,
      components: {
        "PG-3.1": REVENUE_LIFECYCLE_REGISTRY_VERSION,
        "PG-3.2": COMMERCIAL_HEALTH_VERSION,
        "PG-3.3": GROWTH_EVIDENCE_VERSION,
      },
    },
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: PG_3_COMPONENTS.length,
      customerCount: customerIds.size,
      growthEventCount: growth.events.length,
      growthFingerprint: growth.fingerprint,
      certified: pass,
    },
    rollbackReference: {
      ...health.rollbackReference,
      restoreTargets: [...health.rollbackReference.restoreTargets],
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "PG-3.1~PG-3.3",
      closure: "PG-3-Freeze",
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

/** Build immutable PG-3 freeze manifest from PG-3.3 growth evidence. */
export function buildPg3FreezeManifest(): Pg3FreezeManifest {
  const growth = getGrowthEvidence();
  const out = deriveFromGrowth(growth);
  cached = cloneManifest(out);
  return cloneManifest(cached);
}

/** Get last built freeze, or build if none cached. */
export function getPg3FreezeManifest(): Pg3FreezeManifest {
  if (!cached) {
    return buildPg3FreezeManifest();
  }
  return cloneManifest(cached);
}

/** Stable content fingerprint for determinism checks. */
export function pg3FreezeManifestFingerprint(row?: Pg3FreezeManifest): string {
  const v = row ?? getPg3FreezeManifest();
  return v.fingerprint;
}

/** Test helper — clears PG-3 freeze cache only. */
export function clearPg3FreezeManifest(): void {
  cached = null;
}

/** Ensure growth evidence then build freeze (verify scripts). */
export function ensureGrowthThenBuildPg3Freeze(): Pg3FreezeManifest {
  buildGrowthEvidence();
  clearPg3FreezeManifest();
  return buildPg3FreezeManifest();
}
