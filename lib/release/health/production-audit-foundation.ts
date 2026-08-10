/**
 * PG-1.4 — Production Audit Foundation
 * Read-only deterministic production audit contract (no live audit store).
 * Baseline: pg1-deployment-evidence-v1 (derives from PG-1.3).
 * No DB / UI / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../ga-release";
import { RELEASE_ID } from "../release-readiness";
import {
  DEPLOYMENT_EVIDENCE_DEPLOY_REF,
  DEPLOYMENT_EVIDENCE_VERSION,
  PG_1_3_ID,
  PG1_RUNTIME_HEALTH_BASELINE,
  buildDeploymentEvidenceFoundation,
  getDeploymentEvidenceFoundation,
  type DeploymentEvidenceFoundation,
} from "./deployment-evidence-foundation";
import {
  RELEASE_HEALTH_COMMIT_REF,
  type ReleaseHealthVerificationStatus,
} from "./release-health-registry";

export const PG_1_4_ID = "PG-1.4" as const;
export const PRODUCTION_AUDIT_CAPABILITY =
  "ProductionAuditFoundation" as const;
export const PRODUCTION_AUDIT_VERSION =
  "pg-1.4-production-audit-foundation-1" as const;
/** PG-1.3 deployment evidence pack baseline. */
export const PG1_DEPLOYMENT_EVIDENCE_BASELINE =
  "pg1-deployment-evidence-v1" as const;

export const PRODUCTION_AUDIT_EVENT_TYPES = [
  "RELEASE_HEALTH_RECORDED",
  "RUNTIME_HEALTH_RECORDED",
  "DEPLOYMENT_EVIDENCE_RECORDED",
  "PRODUCTION_AUDIT_SEEDED",
] as const;
export type ProductionAuditEventType =
  (typeof PRODUCTION_AUDIT_EVENT_TYPES)[number];

export type ProductionAuditActorSource = Readonly<{
  actor: "system";
  source: "pg-1-health-chain";
  capability: typeof PRODUCTION_AUDIT_CAPABILITY;
}>;

export type ProductionAuditReleaseReference = Readonly<{
  releaseId: typeof RELEASE_ID;
  gaVersion: typeof GA_RELEASE_VERSION;
  freezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  commitSha: typeof RELEASE_HEALTH_COMMIT_REF;
  deploymentRef: typeof DEPLOYMENT_EVIDENCE_DEPLOY_REF;
  parentPack: typeof PG_1_3_ID;
  parentBaseline: typeof PG1_DEPLOYMENT_EVIDENCE_BASELINE;
  parentVersion: typeof DEPLOYMENT_EVIDENCE_VERSION;
}>;

export type ProductionAuditVerificationReference = Readonly<{
  status: ReleaseHealthVerificationStatus;
  evidenceFingerprint: string;
  runtimeParentBaseline: typeof PG1_RUNTIME_HEALTH_BASELINE;
}>;

export type ProductionAuditEvent = Readonly<{
  auditEventId: string;
  eventType: ProductionAuditEventType;
  releaseReference: ProductionAuditReleaseReference;
  actorSource: ProductionAuditActorSource;
  verificationReference: ProductionAuditVerificationReference;
  ordinal: number;
}>;

export type ProductionAuditFoundation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_1_4_ID;
  capability: typeof PRODUCTION_AUDIT_CAPABILITY;
  version: typeof PRODUCTION_AUDIT_VERSION;
  baselineTag: typeof PG1_DEPLOYMENT_EVIDENCE_BASELINE;
  events: readonly ProductionAuditEvent[];
  evidenceFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
  };
}>;

let cached: ProductionAuditFoundation | null = null;

function cloneFoundation(
  row: ProductionAuditFoundation,
): ProductionAuditFoundation {
  return {
    ...row,
    events: row.events.map((e) => ({
      ...e,
      releaseReference: { ...e.releaseReference },
      actorSource: { ...e.actorSource },
      verificationReference: { ...e.verificationReference },
    })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ProductionAuditFoundation, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    events: row.events,
    evidenceFingerprint: row.evidenceFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ProductionAuditFoundation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildEvents(
  evidence: DeploymentEvidenceFoundation,
): ProductionAuditEvent[] {
  const releaseReference: ProductionAuditReleaseReference = {
    releaseId: RELEASE_ID,
    gaVersion: GA_RELEASE_VERSION,
    freezeVersion: GA_RELEASE_FREEZE_VERSION,
    commitSha: RELEASE_HEALTH_COMMIT_REF,
    deploymentRef: DEPLOYMENT_EVIDENCE_DEPLOY_REF,
    parentPack: PG_1_3_ID,
    parentBaseline: PG1_DEPLOYMENT_EVIDENCE_BASELINE,
    parentVersion: DEPLOYMENT_EVIDENCE_VERSION,
  };
  const actorSource: ProductionAuditActorSource = {
    actor: "system",
    source: "pg-1-health-chain",
    capability: PRODUCTION_AUDIT_CAPABILITY,
  };
  const verificationReference: ProductionAuditVerificationReference = {
    status: evidence.verificationStatus,
    evidenceFingerprint: evidence.fingerprint,
    runtimeParentBaseline: PG1_RUNTIME_HEALTH_BASELINE,
  };

  return PRODUCTION_AUDIT_EVENT_TYPES.map((eventType, index) => ({
    auditEventId: `audit-pg14-${String(index + 1).padStart(2, "0")}-${eventType
      .toLowerCase()
      .replace(/_/g, "-")}`,
    eventType,
    releaseReference,
    actorSource,
    verificationReference,
    ordinal: index + 1,
  }));
}

function deriveFromEvidence(
  evidence: DeploymentEvidenceFoundation,
): ProductionAuditFoundation {
  const withoutFp: Omit<ProductionAuditFoundation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_1_4_ID,
    capability: PRODUCTION_AUDIT_CAPABILITY,
    version: PRODUCTION_AUDIT_VERSION,
    baselineTag: PG1_DEPLOYMENT_EVIDENCE_BASELINE,
    events: buildEvents(evidence),
    evidenceFingerprint: evidence.fingerprint,
    scope: {
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

/** Build production audit foundation from PG-1.3 deployment evidence. */
export function buildProductionAuditFoundation(): ProductionAuditFoundation {
  const evidence = getDeploymentEvidenceFoundation();
  const out = deriveFromEvidence(evidence);
  cached = cloneFoundation(out);
  return cloneFoundation(cached);
}

/** Get last built foundation, or build if none cached. */
export function getProductionAuditFoundation(): ProductionAuditFoundation {
  if (!cached) {
    return buildProductionAuditFoundation();
  }
  return cloneFoundation(cached);
}

/** Stable content fingerprint for determinism checks. */
export function productionAuditFoundationFingerprint(
  row?: ProductionAuditFoundation,
): string {
  const v = row ?? getProductionAuditFoundation();
  return v.fingerprint;
}

/** Test helper — clears production audit cache only. */
export function clearProductionAuditFoundation(): void {
  cached = null;
}

/** Ensure deployment evidence then build audit (verify scripts). */
export function ensureEvidenceThenBuildProductionAudit(): ProductionAuditFoundation {
  buildDeploymentEvidenceFoundation();
  clearProductionAuditFoundation();
  return buildProductionAuditFoundation();
}
