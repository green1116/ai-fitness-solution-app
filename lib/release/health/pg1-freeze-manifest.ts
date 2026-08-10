/**
 * PG-1 Freeze — Immutable Operations Baseline
 * Freezes PG-1.1~PG-1.4 health/evidence/audit foundations.
 * Baseline: pg1-production-audit-v1.
 * No DB / UI / redesign / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../ga-release";
import { RELEASE_ID } from "../release-readiness";
import {
  DEPLOYMENT_EVIDENCE_CAPABILITY,
  DEPLOYMENT_EVIDENCE_VERSION,
  PG_1_3_ID,
  PG1_RUNTIME_HEALTH_BASELINE,
} from "./deployment-evidence-foundation";
import {
  PG_1_4_ID,
  PG1_DEPLOYMENT_EVIDENCE_BASELINE,
  PRODUCTION_AUDIT_CAPABILITY,
  PRODUCTION_AUDIT_VERSION,
  buildProductionAuditFoundation,
  getProductionAuditFoundation,
  type ProductionAuditFoundation,
} from "./production-audit-foundation";
import {
  PG_1_1_ID,
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
  RELEASE_HEALTH_REGISTRY_CAPABILITY,
  RELEASE_HEALTH_REGISTRY_VERSION,
  getReleaseHealthRegistry,
  type ReleaseHealthRollbackReference,
} from "./release-health-registry";
import {
  PG_1_2_ID,
  PG1_RELEASE_HEALTH_BASELINE,
  RUNTIME_HEALTH_CAPABILITY,
  RUNTIME_HEALTH_VERSION,
} from "./runtime-health-foundation";

export const PG_1_FREEZE_ID = "PG-1-Freeze" as const;
export const PG_1_FREEZE_CAPABILITY = "Pg1OperationsFreeze" as const;
export const PG_1_FREEZE_VERSION = "pg-1-freeze-1.0.0" as const;
export const PG_1_FREEZE_CODENAME = "PG-1 Operations Baseline Freeze" as const;
export const PG_1_FREEZE_DATE = "2026-08-10" as const;
/** PG-1.4 production audit pack baseline. */
export const PG1_PRODUCTION_AUDIT_BASELINE = "pg1-production-audit-v1" as const;

export type Pg1ComponentStatus = "frozen";

export type Pg1ComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: Pg1ComponentStatus;
}>;

export type Pg1VersionReferences = Readonly<{
  freezeVersion: typeof PG_1_FREEZE_VERSION;
  baselineTag: typeof PG1_PRODUCTION_AUDIT_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  components: {
    "PG-1.1": typeof RELEASE_HEALTH_REGISTRY_VERSION;
    "PG-1.2": typeof RUNTIME_HEALTH_VERSION;
    "PG-1.3": typeof DEPLOYMENT_EVIDENCE_VERSION;
    "PG-1.4": typeof PRODUCTION_AUDIT_VERSION;
  };
}>;

export type Pg1VerificationSummary = Readonly<{
  status: "PASS" | "FAIL";
  componentCount: number;
  auditEventCount: number;
  auditFingerprint: string;
  releaseHealthFingerprint: string;
  certified: boolean;
}>;

export type Pg1FreezeManifest = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_1_FREEZE_ID;
  capability: typeof PG_1_FREEZE_CAPABILITY;
  version: typeof PG_1_FREEZE_VERSION;
  codename: typeof PG_1_FREEZE_CODENAME;
  freezeDate: typeof PG_1_FREEZE_DATE;
  baselineTag: typeof PG1_PRODUCTION_AUDIT_BASELINE;
  components: readonly Pg1ComponentEntry[];
  versionReferences: Pg1VersionReferences;
  verificationSummary: Pg1VerificationSummary;
  rollbackReference: ReleaseHealthRollbackReference;
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "PG-1.1~PG-1.4";
    closure: "PG-1-Freeze";
    immutable: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
  };
}>;

export const PG_1_COMPONENTS: readonly Pg1ComponentEntry[] = [
  {
    id: PG_1_1_ID,
    name: "Release Health Registry",
    capability: RELEASE_HEALTH_REGISTRY_CAPABILITY,
    version: RELEASE_HEALTH_REGISTRY_VERSION,
    baselineTag: POST_GA_PRODUCTION_BASELINE,
    modulePath: "lib/release/health/release-health-registry.ts",
    verifyScript: "scripts/verify-pg-1-1-release-health.ts",
    buildApi: "buildReleaseHealthRegistry",
    status: "frozen",
  },
  {
    id: PG_1_2_ID,
    name: "Runtime Health Foundation",
    capability: RUNTIME_HEALTH_CAPABILITY,
    version: RUNTIME_HEALTH_VERSION,
    baselineTag: PG1_RELEASE_HEALTH_BASELINE,
    modulePath: "lib/release/health/runtime-health-foundation.ts",
    verifyScript: "scripts/verify-pg-1-2-runtime-health.ts",
    buildApi: "buildRuntimeHealthFoundation",
    status: "frozen",
  },
  {
    id: PG_1_3_ID,
    name: "Deployment Evidence Foundation",
    capability: DEPLOYMENT_EVIDENCE_CAPABILITY,
    version: DEPLOYMENT_EVIDENCE_VERSION,
    baselineTag: PG1_RUNTIME_HEALTH_BASELINE,
    modulePath: "lib/release/health/deployment-evidence-foundation.ts",
    verifyScript: "scripts/verify-pg-1-3-deployment-evidence.ts",
    buildApi: "buildDeploymentEvidenceFoundation",
    status: "frozen",
  },
  {
    id: PG_1_4_ID,
    name: "Production Audit Foundation",
    capability: PRODUCTION_AUDIT_CAPABILITY,
    version: PRODUCTION_AUDIT_VERSION,
    baselineTag: PG1_DEPLOYMENT_EVIDENCE_BASELINE,
    modulePath: "lib/release/health/production-audit-foundation.ts",
    verifyScript: "scripts/verify-pg-1-4-production-audit.ts",
    buildApi: "buildProductionAuditFoundation",
    status: "frozen",
  },
] as const;

let cached: Pg1FreezeManifest | null = null;

function cloneManifest(row: Pg1FreezeManifest): Pg1FreezeManifest {
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

function stablePayload(row: Omit<Pg1FreezeManifest, "fingerprint">): string {
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
  row: Omit<Pg1FreezeManifest, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFromAudit(
  audit: ProductionAuditFoundation,
): Pg1FreezeManifest {
  const health = getReleaseHealthRegistry();
  const pass =
    audit.events.length === 4 &&
    audit.events.every((e) => e.verificationReference.status === "PASS") &&
    health.verificationStatus === "PASS" &&
    health.rollbackReference.ready === true &&
    PG_1_COMPONENTS.every((c) => c.status === "frozen");

  const withoutFp: Omit<Pg1FreezeManifest, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_1_FREEZE_ID,
    capability: PG_1_FREEZE_CAPABILITY,
    version: PG_1_FREEZE_VERSION,
    codename: PG_1_FREEZE_CODENAME,
    freezeDate: PG_1_FREEZE_DATE,
    baselineTag: PG1_PRODUCTION_AUDIT_BASELINE,
    components: PG_1_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: PG_1_FREEZE_VERSION,
      baselineTag: PG1_PRODUCTION_AUDIT_BASELINE,
      gaVersion: GA_RELEASE_VERSION,
      gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
      gaBaseline: GA_RELEASE_BASELINE,
      commitReference: RELEASE_HEALTH_COMMIT_REF,
      components: {
        "PG-1.1": RELEASE_HEALTH_REGISTRY_VERSION,
        "PG-1.2": RUNTIME_HEALTH_VERSION,
        "PG-1.3": DEPLOYMENT_EVIDENCE_VERSION,
        "PG-1.4": PRODUCTION_AUDIT_VERSION,
      },
    },
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: PG_1_COMPONENTS.length,
      auditEventCount: audit.events.length,
      auditFingerprint: audit.fingerprint,
      releaseHealthFingerprint: health.fingerprint,
      certified: pass,
    },
    rollbackReference: {
      ...health.rollbackReference,
      restoreTargets: [...health.rollbackReference.restoreTargets],
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "PG-1.1~PG-1.4",
      closure: "PG-1-Freeze",
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

/** Build immutable PG-1 freeze manifest from PG-1.4 audit. */
export function buildPg1FreezeManifest(): Pg1FreezeManifest {
  const audit = getProductionAuditFoundation();
  const out = deriveFromAudit(audit);
  cached = cloneManifest(out);
  return cloneManifest(cached);
}

/** Get last built freeze, or build if none cached. */
export function getPg1FreezeManifest(): Pg1FreezeManifest {
  if (!cached) {
    return buildPg1FreezeManifest();
  }
  return cloneManifest(cached);
}

/** Stable content fingerprint for determinism checks. */
export function pg1FreezeManifestFingerprint(row?: Pg1FreezeManifest): string {
  const v = row ?? getPg1FreezeManifest();
  return v.fingerprint;
}

/** Test helper — clears PG-1 freeze cache only. */
export function clearPg1FreezeManifest(): void {
  cached = null;
}

/** Ensure audit then build freeze (verify scripts). */
export function ensureAuditThenBuildPg1Freeze(): Pg1FreezeManifest {
  buildProductionAuditFoundation();
  clearPg1FreezeManifest();
  return buildPg1FreezeManifest();
}
