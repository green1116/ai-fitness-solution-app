/**
 * V82 — SLA monitoring (read-only)
 */

import type {
  SessionEventsInput,
  SessionSlaStatus,
  SlaMetricStatus,
  SlaThresholds,
} from "./analytics.types";
import { DEFAULT_SLA_THRESHOLDS } from "./analytics.types";

function firstEventMs(
  events: SessionEventsInput["events"],
  type: SessionEventsInput["events"][number]["type"],
): number | undefined {
  const hit = events.find((e) => e.type === type);
  if (!hit) return undefined;
  return new Date(hit.timestamp).getTime();
}

function metricStatus(elapsedMs: number | undefined, thresholdMs: number): SlaMetricStatus {
  if (elapsedMs === undefined) return "pending";
  return elapsedMs <= thresholdMs ? "met" : "breached";
}

export function evaluateSessionSla(
  input: SessionEventsInput,
  options?: { now?: Date; thresholds?: SlaThresholds },
): SessionSlaStatus {
  const now = options?.now ?? new Date();
  const thresholds = options?.thresholds ?? DEFAULT_SLA_THRESHOLDS;
  const releaseMs = new Date(input.signedOffAt).getTime();
  const nowMs = now.getTime();

  const openMs = firstEventMs(input.events, "delivery_opened");
  const downloadMs = firstEventMs(input.events, "artifact_downloaded");
  const failedMs = firstEventMs(input.events, "delivery_failed");

  const releaseToFirstOpenMs = openMs !== undefined ? openMs - releaseMs : undefined;
  const releaseToFirstDownloadMs =
    downloadMs !== undefined ? downloadMs - releaseMs : undefined;

  let releaseToFirstOpen: SlaMetricStatus;
  if (openMs !== undefined) {
    releaseToFirstOpen = metricStatus(releaseToFirstOpenMs, thresholds.firstOpenMs);
  } else if (nowMs - releaseMs > thresholds.firstOpenMs) {
    releaseToFirstOpen = "breached";
  } else {
    releaseToFirstOpen = "pending";
  }

  let releaseToFirstDownload: SlaMetricStatus;
  if (downloadMs !== undefined) {
    releaseToFirstDownload = metricStatus(releaseToFirstDownloadMs, thresholds.firstDownloadMs);
  } else if (nowMs - releaseMs > thresholds.firstDownloadMs) {
    releaseToFirstDownload = "breached";
  } else {
    releaseToFirstDownload = "pending";
  }

  const failedDeliveryAgeMs =
    failedMs !== undefined ? nowMs - failedMs : undefined;
  const failedDeliveryOverdue =
    failedDeliveryAgeMs !== undefined &&
    failedDeliveryAgeMs > thresholds.failedDeliveryAgingMs;

  const breached =
    releaseToFirstOpen === "breached" ||
    releaseToFirstDownload === "breached" ||
    failedDeliveryOverdue;

  const atRisk =
    !breached &&
    (releaseToFirstOpen === "pending" || releaseToFirstDownload === "pending") &&
    (nowMs - releaseMs > thresholds.firstOpenMs * 0.75 ||
      input.events.some((e) => e.type === "pending_action"));

  let overallStatus: SessionSlaStatus["overallStatus"] = "healthy";
  if (breached) overallStatus = "breached";
  else if (atRisk) overallStatus = "at_risk";

  return {
    sessionId: input.sessionId,
    releasePackageId: input.releasePackageId,
    projectName: input.projectName,
    signedOffAt: input.signedOffAt,
    firstOpenMs: releaseToFirstOpenMs,
    firstDownloadMs: releaseToFirstDownloadMs,
    releaseToFirstOpen,
    releaseToFirstDownload,
    failedDeliveryAgeMs,
    failedDeliveryOverdue,
    overallStatus,
    readOnly: true,
  };
}

export function evaluateOrgSla(
  sessions: SessionEventsInput[],
  options?: { now?: Date; thresholds?: SlaThresholds },
): SessionSlaStatus[] {
  return sessions.map((s) => evaluateSessionSla(s, options));
}
