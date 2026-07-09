/**
 * V82 — Delivery alert rules (read-only, derived from ops.store events)
 */

import { randomUUID } from "node:crypto";

import type {
  DeliveryAlert,
  DeliveryAlertKind,
  SessionEventsInput,
  SlaThresholds,
} from "./analytics.types";
import { DEFAULT_SLA_THRESHOLDS } from "./analytics.types";
import { evaluateSessionSla } from "./sla.service";

const ALERT_LABELS: Record<DeliveryAlertKind, string> = {
  no_open_after_release: "发布后未打开",
  download_failure: "下载/交付失败",
  pending_action_too_long: "待处理超时",
  sla_breach: "SLA 违约",
};

export function evaluateSessionAlerts(
  input: SessionEventsInput & { organizationId: string },
  options?: { now?: Date; thresholds?: SlaThresholds },
): DeliveryAlert[] {
  const now = options?.now ?? new Date();
  const thresholds = options?.thresholds ?? DEFAULT_SLA_THRESHOLDS;
  const sla = evaluateSessionSla(input, options);
  const alerts: DeliveryAlert[] = [];
  const nowIso = now.toISOString();
  const releaseMs = new Date(input.signedOffAt).getTime();
  const nowMs = now.getTime();

  const hasOpen = input.events.some((e) => e.type === "delivery_opened");
  const failedEvent = input.events.find((e) => e.type === "delivery_failed");
  const pendingEvent = [...input.events]
    .reverse()
    .find((e) => e.type === "pending_action");

  if (!hasOpen && nowMs - releaseMs > thresholds.firstOpenMs) {
    alerts.push(
      buildAlert({
        sessionId: input.sessionId,
        organizationId: input.organizationId,
        kind: "no_open_after_release",
        severity: "warning",
        message: `${ALERT_LABELS.no_open_after_release} — 发布后超过 SLA 未打开`,
        triggeredAt: nowIso,
        meta: { signedOffAt: input.signedOffAt, elapsedMs: nowMs - releaseMs },
      }),
    );
  }

  if (failedEvent) {
    const ageMs = nowMs - new Date(failedEvent.timestamp).getTime();
    alerts.push(
      buildAlert({
        sessionId: input.sessionId,
        organizationId: input.organizationId,
        kind: "download_failure",
        severity: sla.failedDeliveryOverdue ? "critical" : "warning",
        message: `${ALERT_LABELS.download_failure} — ${failedEvent.meta?.message ?? "交付失败"}`,
        triggeredAt: failedEvent.timestamp,
        meta: { ageMs, artifactKind: failedEvent.artifactKind },
      }),
    );
  }

  if (pendingEvent) {
    const ageMs = nowMs - new Date(pendingEvent.timestamp).getTime();
    if (ageMs > thresholds.pendingActionMaxMs) {
      alerts.push(
        buildAlert({
          sessionId: input.sessionId,
          organizationId: input.organizationId,
          kind: "pending_action_too_long",
          severity: "warning",
          message: `${ALERT_LABELS.pending_action_too_long} — 待处理 ${Math.round(ageMs / 3600000)}h`,
          triggeredAt: pendingEvent.timestamp,
          meta: { ageMs },
        }),
      );
    }
  }

  if (sla.releaseToFirstOpen === "breached" || sla.releaseToFirstDownload === "breached") {
    alerts.push(
      buildAlert({
        sessionId: input.sessionId,
        organizationId: input.organizationId,
        kind: "sla_breach",
        severity: "critical",
        message: `${ALERT_LABELS.sla_breach} — open=${sla.releaseToFirstOpen} download=${sla.releaseToFirstDownload}`,
        triggeredAt: nowIso,
        meta: {
          releaseToFirstOpen: sla.releaseToFirstOpen,
          releaseToFirstDownload: sla.releaseToFirstDownload,
        },
      }),
    );
  }

  return alerts;
}

function buildAlert(input: Omit<DeliveryAlert, "id" | "readOnly">): DeliveryAlert {
  return { ...input, id: randomUUID(), readOnly: true };
}

export function evaluateOrgAlerts(
  sessions: Array<SessionEventsInput & { organizationId: string }>,
  options?: { now?: Date; thresholds?: SlaThresholds },
): DeliveryAlert[] {
  return sessions
    .flatMap((s) => evaluateSessionAlerts(s, options))
    .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));
}
