/**
 * ESCO-3 — Commercial Action Signal
 * Deterministic read-only projection from ESCO-2 CommercialHealth.
 * Maps HEALTHY|WATCH|RISK → RETAIN|WATCH|EXPAND|ESCALATE.
 * No CRM/billing / execution / redesign.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../../release/ga-release";
import {
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
} from "../../release/health/release-health-registry";
import { RELEASE_ID } from "../../release/release-readiness";
import { ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1 } from "../../runtime/freeze";
import {
  COMMERCIAL_HEALTH_VERSION,
  ESCO1_COMMERCIAL_OPERATIONS_BASELINE,
  ESCO_2_ID,
  buildCommercialHealth,
  getCommercialHealth,
  type CommercialHealth,
  type CommercialHealthLevel,
  type CommercialHealthRecord,
} from "./commercial-health";

export const ESCO_3_ID = "ESCO-3" as const;
export const COMMERCIAL_ACTION_SIGNAL_CAPABILITY =
  "CommercialActionSignal" as const;
export const COMMERCIAL_ACTION_SIGNAL_VERSION =
  "esco-3-commercial-action-signal-1" as const;
/** ESCO-2 commercial health pack baseline. */
export const ESCO2_COMMERCIAL_HEALTH_BASELINE =
  "esco2-commercial-health-v1" as const;

export const COMMERCIAL_ACTIONS = [
  "RETAIN",
  "WATCH",
  "EXPAND",
  "ESCALATE",
] as const;
export type CommercialAction = (typeof COMMERCIAL_ACTIONS)[number];

export type CommercialActionSignalRecord = Readonly<{
  customerId: string;
  tenantId: string;
  action: CommercialAction;
  reason: string;
  sourceHealth: CommercialHealthLevel;
  fingerprint: string;
  ordinal: number;
}>;

export type CommercialActionSignal = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCO_3_ID;
  capability: typeof COMMERCIAL_ACTION_SIGNAL_CAPABILITY;
  version: typeof COMMERCIAL_ACTION_SIGNAL_VERSION;
  baselineTag: typeof ESCO2_COMMERCIAL_HEALTH_BASELINE;
  parentPack: typeof ESCO_2_ID;
  parentVersion: typeof COMMERCIAL_HEALTH_VERSION;
  parentBaseline: typeof ESCO1_COMMERCIAL_OPERATIONS_BASELINE;
  productBaseline: typeof ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  signals: readonly CommercialActionSignalRecord[];
  signalCount: number;
  retainCount: number;
  watchCount: number;
  expandCount: number;
  escalateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  commercialHealthFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noExecution: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noArlV2: true;
    noRso9: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: CommercialActionSignal | null = null;

function cloneSignal(row: CommercialActionSignal): CommercialActionSignal {
  return {
    ...row,
    signals: row.signals.map((s) => ({ ...s })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CommercialActionSignal, "fingerprint">,
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
    productBaseline: row.productBaseline,
    productionBaseline: row.productionBaseline,
    signals: row.signals,
    signalCount: row.signalCount,
    retainCount: row.retainCount,
    watchCount: row.watchCount,
    expandCount: row.expandCount,
    escalateCount: row.escalateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    commercialHealthFingerprint: row.commercialHealthFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CommercialActionSignal, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CommercialActionSignalRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        action: row.action,
        reason: row.reason,
        sourceHealth: row.sourceHealth,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map commercial health level to a read-only action signal. */
export function commercialActionFromHealth(
  record: CommercialHealthRecord,
): { action: CommercialAction; reason: string } {
  if (record.health === "RISK") {
    return { action: "ESCALATE", reason: "escalate-from-risk" };
  }
  if (record.health === "WATCH") {
    return { action: "WATCH", reason: "watch-from-health" };
  }
  if (record.customerId.includes("expansion")) {
    return { action: "EXPAND", reason: "expand-from-healthy" };
  }
  return { action: "RETAIN", reason: "retain-from-healthy" };
}

function projectSignal(
  record: CommercialHealthRecord,
): CommercialActionSignalRecord {
  const mapped = commercialActionFromHealth(record);
  const withoutFp: Omit<CommercialActionSignalRecord, "fingerprint"> = {
    customerId: record.customerId,
    tenantId: record.tenantId,
    action: mapped.action,
    reason: mapped.reason,
    sourceHealth: record.health,
    ordinal: record.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromHealth(health: CommercialHealth): CommercialActionSignal {
  const signals = health.records.map(projectSignal);
  const retainCount = signals.filter((s) => s.action === "RETAIN").length;
  const watchCount = signals.filter((s) => s.action === "WATCH").length;
  const expandCount = signals.filter((s) => s.action === "EXPAND").length;
  const escalateCount = signals.filter((s) => s.action === "ESCALATE").length;

  const withoutFp: Omit<CommercialActionSignal, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCO_3_ID,
    capability: COMMERCIAL_ACTION_SIGNAL_CAPABILITY,
    version: COMMERCIAL_ACTION_SIGNAL_VERSION,
    baselineTag: ESCO2_COMMERCIAL_HEALTH_BASELINE,
    parentPack: ESCO_2_ID,
    parentVersion: COMMERCIAL_HEALTH_VERSION,
    parentBaseline: ESCO1_COMMERCIAL_OPERATIONS_BASELINE,
    productBaseline: ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    signals,
    signalCount: signals.length,
    retainCount,
    watchCount,
    expandCount,
    escalateCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    commercialHealthFingerprint: health.fingerprint,
    scope: {
      readOnly: true,
      noExecution: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
      noArlV2: true,
      noRso9: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
      gaBaselineUnchanged: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build CommercialActionSignal from ESCO-2 CommercialHealth. */
export function buildCommercialActionSignal(): CommercialActionSignal {
  const health = getCommercialHealth();
  const out = deriveFromHealth(health);
  cached = cloneSignal(out);
  return cloneSignal(cached);
}

/** Get last built CommercialActionSignal, or build if none cached. */
export function getCommercialActionSignal(): CommercialActionSignal {
  if (!cached) {
    return buildCommercialActionSignal();
  }
  return cloneSignal(cached);
}

/** Stable content fingerprint for determinism checks. */
export function commercialActionSignalFingerprint(
  row?: CommercialActionSignal,
): string {
  const v = row ?? getCommercialActionSignal();
  return v.fingerprint;
}

/** Test helper — clears ESCO-3 cache only. */
export function clearCommercialActionSignal(): void {
  cached = null;
}

/** Ensure ESCO-2 then build ESCO-3 (verify scripts). */
export function ensureHealthThenBuildCommercialActionSignal(): CommercialActionSignal {
  buildCommercialHealth();
  clearCommercialActionSignal();
  return buildCommercialActionSignal();
}
