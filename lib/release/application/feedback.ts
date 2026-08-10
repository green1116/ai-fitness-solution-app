/**
 * ARL-6 — Release Feedback Loop Integration
 * Deterministic ApplicationReleaseFeedback connecting ARL-5 with PG-2/PG-3 signals.
 * Baseline: arl5-production-release-v1.
 * No GA baseline mutation / Project·Quote·Tender / redesign / live probes.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../ga-release";
import {
  ADOPTION_HEALTH_VERSION,
  PG_2_2_ID,
  getAdoptionHealth,
  type AdoptionHealthFoundation,
  type AdoptionHealthRecord,
  type AdoptionHealthStatus,
} from "../customer/adoption-health";
import {
  RELEASE_HEALTH_COMMIT_REF,
  type ReleaseHealthRollbackReference,
} from "../health/release-health-registry";
import {
  COMMERCIAL_HEALTH_VERSION,
  PG_3_2_ID,
  getCommercialHealth,
  type CommercialHealthFoundation,
  type CommercialHealthRecord,
  type CommercialHealthStatus,
  type ExpansionReadiness,
  type GrowthSignal,
} from "../revenue/commercial-health";
import { RELEASE_ID } from "../release-readiness";
import {
  APPLICATION_PRODUCTION_RELEASE_VERSION,
  ARL_5_ID,
  ARL4_DEPLOYMENT_EVIDENCE_BASELINE,
  buildApplicationProductionRelease,
  getApplicationProductionRelease,
  type ApplicationProductionRelease,
  type ApplicationProductionReleaseStatus,
} from "./production-release";

export const ARL_6_ID = "ARL-6" as const;
export const APPLICATION_RELEASE_FEEDBACK_CAPABILITY =
  "ApplicationReleaseFeedback" as const;
export const APPLICATION_RELEASE_FEEDBACK_VERSION =
  "arl-6-feedback-loop-1" as const;
/** ARL-5 production release pack baseline. */
export const ARL5_PRODUCTION_RELEASE_BASELINE =
  "arl5-production-release-v1" as const;

export const APPLICATION_RELEASE_FEEDBACK_CHANNELS = [
  "PRODUCTION_RELEASE",
  "CUSTOMER_ADOPTION",
  "COMMERCIAL_GROWTH",
] as const;
export type ApplicationReleaseFeedbackChannel =
  (typeof APPLICATION_RELEASE_FEEDBACK_CHANNELS)[number];

export const APPLICATION_RELEASE_FEEDBACK_ACTIONS = [
  "RETAIN",
  "WATCH",
  "EXPAND",
  "ESCALATE",
] as const;
export type ApplicationReleaseFeedbackAction =
  (typeof APPLICATION_RELEASE_FEEDBACK_ACTIONS)[number];

export const APPLICATION_RELEASE_FEEDBACK_STATUSES = [
  "INTEGRATED",
  "WATCH",
  "BLOCKED",
] as const;
export type ApplicationReleaseFeedbackStatus =
  (typeof APPLICATION_RELEASE_FEEDBACK_STATUSES)[number];

export type ApplicationReleaseFeedbackChannelRef = Readonly<{
  channel: ApplicationReleaseFeedbackChannel;
  sourcePack: string;
  sourceVersion: string;
  sourceFingerprint: string;
  signalCount: number;
}>;

export type ApplicationReleaseFeedbackRecord = Readonly<{
  customerId: string;
  feedbackEventId: string;
  adoptionHealth: AdoptionHealthStatus;
  commercialHealth: CommercialHealthStatus;
  growthSignal: GrowthSignal;
  expansionReadiness: ExpansionReadiness;
  action: ApplicationReleaseFeedbackAction;
  ordinal: number;
}>;

export type ApplicationReleaseFeedback = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ARL_6_ID;
  capability: typeof APPLICATION_RELEASE_FEEDBACK_CAPABILITY;
  version: typeof APPLICATION_RELEASE_FEEDBACK_VERSION;
  baselineTag: typeof ARL5_PRODUCTION_RELEASE_BASELINE;
  feedbackId: string;
  status: ApplicationReleaseFeedbackStatus;
  certification: "certified" | "blocked";
  productionReleaseId: string;
  productionStatus: ApplicationProductionReleaseStatus;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  channels: readonly ApplicationReleaseFeedbackChannelRef[];
  records: readonly ApplicationReleaseFeedbackRecord[];
  customerSignalCount: number;
  commercialSignalCount: number;
  escalateCount: number;
  rollbackReference: ReleaseHealthRollbackReference;
  parentPack: typeof ARL_5_ID;
  parentVersion: typeof APPLICATION_PRODUCTION_RELEASE_VERSION;
  parentBaseline: typeof ARL4_DEPLOYMENT_EVIDENCE_BASELINE;
  customerPack: typeof PG_2_2_ID;
  customerVersion: typeof ADOPTION_HEALTH_VERSION;
  commercialPack: typeof PG_3_2_ID;
  commercialVersion: typeof COMMERCIAL_HEALTH_VERSION;
  productionReleaseFingerprint: string;
  adoptionHealthFingerprint: string;
  commercialHealthFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noLiveProbes: true;
    noDatabase: true;
    noUi: true;
    noBilling: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: ApplicationReleaseFeedback | null = null;

function cloneFeedback(
  row: ApplicationReleaseFeedback,
): ApplicationReleaseFeedback {
  return {
    ...row,
    channels: row.channels.map((c) => ({ ...c })),
    records: row.records.map((r) => ({ ...r })),
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ApplicationReleaseFeedback, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    feedbackId: row.feedbackId,
    status: row.status,
    certification: row.certification,
    productionReleaseId: row.productionReleaseId,
    productionStatus: row.productionStatus,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    channels: row.channels,
    records: row.records,
    customerSignalCount: row.customerSignalCount,
    commercialSignalCount: row.commercialSignalCount,
    escalateCount: row.escalateCount,
    rollbackReference: row.rollbackReference,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    customerPack: row.customerPack,
    customerVersion: row.customerVersion,
    commercialPack: row.commercialPack,
    commercialVersion: row.commercialVersion,
    productionReleaseFingerprint: row.productionReleaseFingerprint,
    adoptionHealthFingerprint: row.adoptionHealthFingerprint,
    commercialHealthFingerprint: row.commercialHealthFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ApplicationReleaseFeedback, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function mapAction(
  adoption: AdoptionHealthRecord,
  commercial: CommercialHealthRecord,
): ApplicationReleaseFeedbackAction {
  if (
    adoption.healthStatus === "CRITICAL" ||
    commercial.commercialHealth === "CRITICAL"
  ) {
    return "ESCALATE";
  }
  if (
    commercial.expansionReadiness === "READY" ||
    commercial.expansionReadiness === "IN_MOTION" ||
    commercial.growthSignal === "HIGH"
  ) {
    return "EXPAND";
  }
  if (
    adoption.healthStatus === "WATCH" ||
    adoption.healthStatus === "AT_RISK" ||
    commercial.commercialHealth === "WATCH" ||
    commercial.commercialHealth === "AT_RISK"
  ) {
    return "WATCH";
  }
  return "RETAIN";
}

function joinRecords(
  adoption: AdoptionHealthFoundation,
  commercial: CommercialHealthFoundation,
): ApplicationReleaseFeedbackRecord[] {
  const commercialById = new Map(
    commercial.records.map((r) => [r.customerId, r] as const),
  );

  return adoption.records
    .map((row, index) => {
      const commercialRow = commercialById.get(row.customerId);
      if (!commercialRow) return null;
      return {
        customerId: row.customerId,
        feedbackEventId: `arl6-feedback-${row.customerId}`,
        adoptionHealth: row.healthStatus,
        commercialHealth: commercialRow.commercialHealth,
        growthSignal: commercialRow.growthSignal,
        expansionReadiness: commercialRow.expansionReadiness,
        action: mapAction(row, commercialRow),
        ordinal: index + 1,
      } satisfies ApplicationReleaseFeedbackRecord;
    })
    .filter((r): r is ApplicationReleaseFeedbackRecord => r !== null);
}

function deriveStatus(
  production: ApplicationProductionRelease,
  records: readonly ApplicationReleaseFeedbackRecord[],
): ApplicationReleaseFeedbackStatus {
  if (
    production.status !== "READY" ||
    production.certification !== "certified"
  ) {
    return "BLOCKED";
  }
  if (records.some((r) => r.action === "ESCALATE")) {
    return "WATCH";
  }
  if (records.length === 0) {
    return "BLOCKED";
  }
  return "INTEGRATED";
}

function deriveFromSources(
  production: ApplicationProductionRelease,
  adoption: AdoptionHealthFoundation,
  commercial: CommercialHealthFoundation,
): ApplicationReleaseFeedback {
  const records = joinRecords(adoption, commercial);
  const status = deriveStatus(production, records);
  const escalateCount = records.filter((r) => r.action === "ESCALATE").length;

  const channels: ApplicationReleaseFeedbackChannelRef[] = [
    {
      channel: "PRODUCTION_RELEASE",
      sourcePack: ARL_5_ID,
      sourceVersion: APPLICATION_PRODUCTION_RELEASE_VERSION,
      sourceFingerprint: production.fingerprint,
      signalCount: 1,
    },
    {
      channel: "CUSTOMER_ADOPTION",
      sourcePack: PG_2_2_ID,
      sourceVersion: ADOPTION_HEALTH_VERSION,
      sourceFingerprint: adoption.fingerprint,
      signalCount: adoption.records.length,
    },
    {
      channel: "COMMERCIAL_GROWTH",
      sourcePack: PG_3_2_ID,
      sourceVersion: COMMERCIAL_HEALTH_VERSION,
      sourceFingerprint: commercial.fingerprint,
      signalCount: commercial.records.length,
    },
  ];

  const withoutFp: Omit<ApplicationReleaseFeedback, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ARL_6_ID,
    capability: APPLICATION_RELEASE_FEEDBACK_CAPABILITY,
    version: APPLICATION_RELEASE_FEEDBACK_VERSION,
    baselineTag: ARL5_PRODUCTION_RELEASE_BASELINE,
    feedbackId: "arl6-feedback-loop-1",
    status,
    certification: status === "BLOCKED" ? "blocked" : "certified",
    productionReleaseId: production.productionReleaseId,
    productionStatus: production.status,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    channels,
    records,
    customerSignalCount: adoption.records.length,
    commercialSignalCount: commercial.records.length,
    escalateCount,
    rollbackReference: {
      ...production.rollbackReference,
      restoreTargets: [...production.rollbackReference.restoreTargets],
    },
    parentPack: ARL_5_ID,
    parentVersion: APPLICATION_PRODUCTION_RELEASE_VERSION,
    parentBaseline: ARL4_DEPLOYMENT_EVIDENCE_BASELINE,
    customerPack: PG_2_2_ID,
    customerVersion: ADOPTION_HEALTH_VERSION,
    commercialPack: PG_3_2_ID,
    commercialVersion: COMMERCIAL_HEALTH_VERSION,
    productionReleaseFingerprint: production.fingerprint,
    adoptionHealthFingerprint: adoption.fingerprint,
    commercialHealthFingerprint: commercial.fingerprint,
    scope: {
      readOnly: true,
      noLiveProbes: true,
      noDatabase: true,
      noUi: true,
      noBilling: true,
      additiveOnly: true,
      gaBaselineUnchanged: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build ApplicationReleaseFeedback from ARL-5 + PG-2/PG-3 signals. */
export function buildApplicationReleaseFeedback(): ApplicationReleaseFeedback {
  const production = getApplicationProductionRelease();
  const adoption = getAdoptionHealth();
  const commercial = getCommercialHealth();
  const out = deriveFromSources(production, adoption, commercial);
  cached = cloneFeedback(out);
  return cloneFeedback(cached);
}

/** Get last built feedback, or build if none cached. */
export function getApplicationReleaseFeedback(): ApplicationReleaseFeedback {
  if (!cached) {
    return buildApplicationReleaseFeedback();
  }
  return cloneFeedback(cached);
}

/** Stable content fingerprint for determinism checks. */
export function applicationReleaseFeedbackFingerprint(
  row?: ApplicationReleaseFeedback,
): string {
  const v = row ?? getApplicationReleaseFeedback();
  return v.fingerprint;
}

/** Test helper — clears ARL-6 cache only. */
export function clearApplicationReleaseFeedback(): void {
  cached = null;
}

/** Ensure ARL-5 then build ARL-6 (verify scripts). */
export function ensureProductionThenBuildApplicationReleaseFeedback(): ApplicationReleaseFeedback {
  buildApplicationProductionRelease();
  clearApplicationReleaseFeedback();
  return buildApplicationReleaseFeedback();
}
