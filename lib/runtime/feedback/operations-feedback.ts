/**
 * RSO-7 — Operations Feedback
 * Deterministic feedback projection from RSO-6 ServiceReliability + PG/ARL links.
 * Baseline: rso6-service-reliability-v1 (traces post-ga-production-baseline-v1).
 * Reuses existing PG/ARL capabilities — no new governance / ARL v2 / external I/O.
 */

import { createHash } from "node:crypto";

import {
  APPLICATION_RELEASE_FEEDBACK_CAPABILITY,
  APPLICATION_RELEASE_FEEDBACK_VERSION,
  ARL_6_ID,
  getApplicationReleaseFeedback,
} from "../../release/application/feedback";
import {
  ADOPTION_HEALTH_CAPABILITY,
  ADOPTION_HEALTH_VERSION,
  PG_2_2_ID,
  getAdoptionHealth,
} from "../../release/customer/adoption-health";
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
import {
  COMMERCIAL_HEALTH_CAPABILITY,
  COMMERCIAL_HEALTH_VERSION,
  PG_3_2_ID,
  getCommercialHealth,
} from "../../release/revenue/commercial-health";
import {
  RSO5_TENANT_OPERATIONS_BASELINE,
  RSO_6_ID,
  SERVICE_RELIABILITY_CAPABILITY,
  SERVICE_RELIABILITY_VERSION,
  buildServiceReliability,
  getServiceReliability,
  type ReliabilityMetric,
  type ServiceReliability,
  type ServiceReliabilityStatus,
} from "../reliability";
import {
  aggregateOperationsFeedbackStatus,
  operationsFeedbackStatusFromGrade,
  type OperationsFeedbackChannel,
  type OperationsFeedbackItem,
  type OperationsFeedbackLink,
  type OperationsFeedbackStatus,
} from "./operations-feedback-status";

export const RSO_7_ID = "RSO-7" as const;
export const OPERATIONS_FEEDBACK_CAPABILITY = "OperationsFeedback" as const;
export const OPERATIONS_FEEDBACK_VERSION =
  "rso-7-operations-feedback-1" as const;
/** RSO-6 service reliability pack baseline. */
export const RSO6_SERVICE_RELIABILITY_BASELINE =
  "rso6-service-reliability-v1" as const;

export type OperationsFeedback = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RSO_7_ID;
  capability: typeof OPERATIONS_FEEDBACK_CAPABILITY;
  version: typeof OPERATIONS_FEEDBACK_VERSION;
  baselineTag: typeof RSO6_SERVICE_RELIABILITY_BASELINE;
  parentPack: typeof RSO_6_ID;
  parentVersion: typeof SERVICE_RELIABILITY_VERSION;
  parentBaseline: typeof RSO5_TENANT_OPERATIONS_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  status: OperationsFeedbackStatus;
  reliabilityStatus: ServiceReliabilityStatus;
  items: readonly OperationsFeedbackItem[];
  itemCount: number;
  closedCount: number;
  watchCount: number;
  openCount: number;
  links: readonly OperationsFeedbackLink[];
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  serviceReliabilityFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noNewGovernance: true;
    noArlV2: true;
    noExternalIntegration: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: OperationsFeedback | null = null;

function cloneFeedback(row: OperationsFeedback): OperationsFeedback {
  return {
    ...row,
    items: row.items.map((i) => ({ ...i })),
    links: row.links.map((l) => ({ ...l })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<OperationsFeedback, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    status: row.status,
    reliabilityStatus: row.reliabilityStatus,
    items: row.items,
    itemCount: row.itemCount,
    closedCount: row.closedCount,
    watchCount: row.watchCount,
    openCount: row.openCount,
    links: row.links,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    serviceReliabilityFingerprint: row.serviceReliabilityFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<OperationsFeedback, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectItem(
  metric: ReliabilityMetric,
  ordinal: number,
): OperationsFeedbackItem {
  return {
    feedbackItemId: `rso7-item-${metric.sourceCheckId.toLowerCase()}`,
    sourceMetricId: metric.metricId,
    sourceCheckId: metric.sourceCheckId,
    tenantId: metric.tenantId,
    status: operationsFeedbackStatusFromGrade(metric.grade),
    grade: metric.grade,
    score: metric.score,
    summary: metric.summary,
    detail: metric.detail,
    ordinal,
  };
}

function buildLinks(
  reliability: ServiceReliability,
): OperationsFeedbackLink[] {
  const adoption = getAdoptionHealth();
  const commercial = getCommercialHealth();
  const releaseFeedback = getApplicationReleaseFeedback();

  const links: OperationsFeedbackLink[] = [
    {
      channel: "SERVICE_RELIABILITY",
      sourcePack: RSO_6_ID,
      sourceCapability: SERVICE_RELIABILITY_CAPABILITY,
      sourceVersion: SERVICE_RELIABILITY_VERSION,
      sourceFingerprint: reliability.fingerprint,
    },
    {
      channel: "CUSTOMER_ADOPTION",
      sourcePack: PG_2_2_ID,
      sourceCapability: ADOPTION_HEALTH_CAPABILITY,
      sourceVersion: ADOPTION_HEALTH_VERSION,
      sourceFingerprint: adoption.fingerprint,
    },
    {
      channel: "COMMERCIAL_GROWTH",
      sourcePack: PG_3_2_ID,
      sourceCapability: COMMERCIAL_HEALTH_CAPABILITY,
      sourceVersion: COMMERCIAL_HEALTH_VERSION,
      sourceFingerprint: commercial.fingerprint,
    },
    {
      channel: "RELEASE_FEEDBACK",
      sourcePack: ARL_6_ID,
      sourceCapability: APPLICATION_RELEASE_FEEDBACK_CAPABILITY,
      sourceVersion: APPLICATION_RELEASE_FEEDBACK_VERSION,
      sourceFingerprint: releaseFeedback.fingerprint,
    },
  ];

  return links;
}

function deriveFromReliability(
  reliability: ServiceReliability,
): OperationsFeedback {
  const items = reliability.metrics.map((metric, index) =>
    projectItem(metric, index + 1),
  );
  const closedCount = items.filter((i) => i.status === "CLOSED").length;
  const watchCount = items.filter((i) => i.status === "WATCH").length;
  const openCount = items.filter((i) => i.status === "OPEN").length;
  const status = aggregateOperationsFeedbackStatus(items.map((i) => i.status));
  const links = buildLinks(reliability);

  const withoutFp: Omit<OperationsFeedback, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: RSO_7_ID,
    capability: OPERATIONS_FEEDBACK_CAPABILITY,
    version: OPERATIONS_FEEDBACK_VERSION,
    baselineTag: RSO6_SERVICE_RELIABILITY_BASELINE,
    parentPack: RSO_6_ID,
    parentVersion: SERVICE_RELIABILITY_VERSION,
    parentBaseline: RSO5_TENANT_OPERATIONS_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    status,
    reliabilityStatus: reliability.status,
    items,
    itemCount: items.length,
    closedCount,
    watchCount,
    openCount,
    links,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    serviceReliabilityFingerprint: reliability.fingerprint,
    scope: {
      readOnly: true,
      noNewGovernance: true,
      noArlV2: true,
      noExternalIntegration: true,
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

/** Build OperationsFeedback from RSO-6 + existing PG/ARL capabilities. */
export function buildOperationsFeedback(): OperationsFeedback {
  const reliability = getServiceReliability();
  const out = deriveFromReliability(reliability);
  cached = cloneFeedback(out);
  return cloneFeedback(cached);
}

/** Get last built OperationsFeedback, or build if none cached. */
export function getOperationsFeedback(): OperationsFeedback {
  if (!cached) {
    return buildOperationsFeedback();
  }
  return cloneFeedback(cached);
}

/** Stable content fingerprint for determinism checks. */
export function operationsFeedbackFingerprint(
  row?: OperationsFeedback,
): string {
  const v = row ?? getOperationsFeedback();
  return v.fingerprint;
}

/** Test helper — clears RSO-7 cache only. */
export function clearOperationsFeedback(): void {
  cached = null;
}

/** Ensure RSO-6 then build RSO-7 (verify scripts). */
export function ensureReliabilityThenBuildOperationsFeedback(): OperationsFeedback {
  buildServiceReliability();
  clearOperationsFeedback();
  return buildOperationsFeedback();
}

export type {
  OperationsFeedbackChannel,
  OperationsFeedbackItem,
  OperationsFeedbackLink,
  OperationsFeedbackStatus,
};
