/**
 * RSO-8 — Runtime Operations Freeze
 * Freezes RSO-1..RSO-7 as Enterprise SaaS Runtime Operations v1.
 * Baseline: rso7-operations-feedback-v1 (traces post-ga-production-baseline-v1).
 * Freeze only — no new runtime capability / prisma / redesign.
 */

import { createHash } from "node:crypto";

import { RELEASE_ID } from "../../release/release-readiness";
import {
  getReleaseHealthRegistry,
  type ReleaseHealthRollbackReference,
} from "../../release/health/release-health-registry";
import {
  getOperationsFeedback,
  buildOperationsFeedback,
  type OperationsFeedback,
} from "../feedback";
import { getRuntimeHealth } from "../health";
import { getRuntimeIncidents } from "../incident";
import { getApplicationMonitoring } from "../monitoring";
import { getRecoveryWorkflow } from "../recovery";
import { getServiceReliability } from "../reliability";
import { getTenantOperations } from "../tenant";
import {
  RSO_8_ID,
  RUNTIME_OPERATIONS_FREEZE_CAPABILITY,
  RUNTIME_OPERATIONS_FREEZE_CODENAME,
  RUNTIME_OPERATIONS_FREEZE_DATE,
  RUNTIME_OPERATIONS_FREEZE_VERSION,
  RSO7_OPERATIONS_FEEDBACK_BASELINE,
  buildRuntimeOperationsBaseline,
  type RuntimeOperationsBaseline,
} from "./runtime-operations-baseline";
import {
  RSO_RUNTIME_COMPONENTS,
  buildRuntimeOperationsVersionReferences,
  type RuntimeOperationsManifest,
} from "./runtime-operations-manifest";

export type RuntimeOperationsVerificationSummary = Readonly<{
  status: "PASS" | "FAIL";
  componentCount: number;
  feedbackItemCount: number;
  feedbackLinkCount: number;
  operationsFeedbackFingerprint: string;
  certified: boolean;
}>;

export type RuntimeOperationsFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RSO_8_ID;
  capability: typeof RUNTIME_OPERATIONS_FREEZE_CAPABILITY;
  version: typeof RUNTIME_OPERATIONS_FREEZE_VERSION;
  codename: typeof RUNTIME_OPERATIONS_FREEZE_CODENAME;
  freezeDate: typeof RUNTIME_OPERATIONS_FREEZE_DATE;
  baselineTag: typeof RSO7_OPERATIONS_FEEDBACK_BASELINE;
  baseline: RuntimeOperationsBaseline;
  manifest: RuntimeOperationsManifest;
  verificationSummary: RuntimeOperationsVerificationSummary;
  rollbackReference: ReleaseHealthRollbackReference;
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "RSO-1~RSO-7";
    closure: "RSO-8-Freeze";
    product: "Enterprise SaaS Runtime Operations v1";
    immutable: true;
    freezeOnly: true;
    noNewRuntimeCapability: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    productionBaselineUnchanged: true;
  };
}>;

let cached: RuntimeOperationsFreeze | null = null;

function cloneFreeze(row: RuntimeOperationsFreeze): RuntimeOperationsFreeze {
  return {
    ...row,
    baseline: { ...row.baseline },
    manifest: {
      ...row.manifest,
      components: row.manifest.components.map((c) => ({ ...c })),
      versionReferences: {
        ...row.manifest.versionReferences,
        components: { ...row.manifest.versionReferences.components },
      },
      componentFingerprints: { ...row.manifest.componentFingerprints },
    },
    verificationSummary: { ...row.verificationSummary },
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<RuntimeOperationsFreeze, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    baseline: row.baseline,
    manifest: row.manifest,
    verificationSummary: row.verificationSummary,
    rollbackReference: row.rollbackReference,
    certification: row.certification,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RuntimeOperationsFreeze, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildManifest(
  feedback: OperationsFeedback,
): RuntimeOperationsManifest {
  const health = getRuntimeHealth();
  const monitoring = getApplicationMonitoring();
  const incidents = getRuntimeIncidents();
  const recovery = getRecoveryWorkflow();
  const tenantOps = getTenantOperations();
  const reliability = getServiceReliability();

  return {
    productBaseline: buildRuntimeOperationsBaseline().productBaseline,
    packBaseline: RSO7_OPERATIONS_FEEDBACK_BASELINE,
    productionBaseline: buildRuntimeOperationsBaseline().productionBaseline,
    components: RSO_RUNTIME_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: buildRuntimeOperationsVersionReferences(),
    componentFingerprints: {
      "RSO-1": health.fingerprint,
      "RSO-2": monitoring.fingerprint,
      "RSO-3": incidents.fingerprint,
      "RSO-4": recovery.fingerprint,
      "RSO-5": tenantOps.fingerprint,
      "RSO-6": reliability.fingerprint,
      "RSO-7": feedback.fingerprint,
    },
  };
}

function deriveFromFeedback(
  feedback: OperationsFeedback,
): RuntimeOperationsFreeze {
  const health = getReleaseHealthRegistry();
  const baseline = buildRuntimeOperationsBaseline();
  const manifest = buildManifest(feedback);

  const pass =
    RSO_RUNTIME_COMPONENTS.length === 7 &&
    RSO_RUNTIME_COMPONENTS.every((c) => c.status === "frozen") &&
    feedback.itemCount > 0 &&
    feedback.links.length === 4 &&
    feedback.fingerprint.length === 64 &&
    Object.values(manifest.componentFingerprints).every((fp) => fp.length === 64) &&
    health.verificationStatus === "PASS" &&
    health.rollbackReference.ready === true &&
    baseline.productionBaseline === "post-ga-production-baseline-v1" &&
    baseline.productionBaselineImmutable === true;

  const withoutFp: Omit<RuntimeOperationsFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: RSO_8_ID,
    capability: RUNTIME_OPERATIONS_FREEZE_CAPABILITY,
    version: RUNTIME_OPERATIONS_FREEZE_VERSION,
    codename: RUNTIME_OPERATIONS_FREEZE_CODENAME,
    freezeDate: RUNTIME_OPERATIONS_FREEZE_DATE,
    baselineTag: RSO7_OPERATIONS_FEEDBACK_BASELINE,
    baseline,
    manifest,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: RSO_RUNTIME_COMPONENTS.length,
      feedbackItemCount: feedback.itemCount,
      feedbackLinkCount: feedback.links.length,
      operationsFeedbackFingerprint: feedback.fingerprint,
      certified: pass,
    },
    rollbackReference: {
      ...health.rollbackReference,
      restoreTargets: [...health.rollbackReference.restoreTargets],
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "RSO-1~RSO-7",
      closure: "RSO-8-Freeze",
      product: "Enterprise SaaS Runtime Operations v1",
      immutable: true,
      freezeOnly: true,
      noNewRuntimeCapability: true,
      readOnly: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
      productionBaselineUnchanged: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build immutable RuntimeOperationsFreeze from RSO-7 feedback. */
export function buildRuntimeOperationsFreeze(): RuntimeOperationsFreeze {
  const feedback = getOperationsFeedback();
  const out = deriveFromFeedback(feedback);
  cached = cloneFreeze(out);
  return cloneFreeze(cached);
}

/** Get last built freeze, or build if none cached. */
export function getRuntimeOperationsFreeze(): RuntimeOperationsFreeze {
  if (!cached) {
    return buildRuntimeOperationsFreeze();
  }
  return cloneFreeze(cached);
}

/** Stable content fingerprint for determinism checks. */
export function runtimeOperationsFreezeFingerprint(
  row?: RuntimeOperationsFreeze,
): string {
  const v = row ?? getRuntimeOperationsFreeze();
  return v.fingerprint;
}

/** Test helper — clears RSO-8 cache only. */
export function clearRuntimeOperationsFreeze(): void {
  cached = null;
}

/** Ensure RSO-7 then build RSO-8 freeze (verify scripts). */
export function ensureFeedbackThenBuildRuntimeOperationsFreeze(): RuntimeOperationsFreeze {
  buildOperationsFeedback();
  clearRuntimeOperationsFreeze();
  return buildRuntimeOperationsFreeze();
}

export type { RuntimeOperationsManifest };
export type { RuntimeOperationsBaseline };
