/**
 * V81 — Customer delivery tracking events
 */

import { appendIntakeAudit } from "@/lib/pilot/v80";
import { getIntakeSession } from "@/lib/pilot/v80";
import { appendDeliveryTrackingEvent, listDeliveryTrackingEvents } from "./ops.store";
import { emitDeliveryOpsNotification } from "./notification.service";
import type {
  DeliveryPackageStatus,
  DeliveryTrackingEvent,
  DeliveryTrackingEventType,
} from "./ops.types";

export type RecordTrackingInput = {
  sessionId: string;
  organizationId: string;
  actorId?: string;
  type: DeliveryTrackingEventType;
  artifactKind?: string;
  meta?: Record<string, unknown>;
};

export function derivePackageStatus(events: DeliveryTrackingEvent[]): DeliveryPackageStatus {
  if (events.some((e) => e.type === "delivery_failed")) return "failed_delivery";
  if (events.some((e) => e.type === "pending_action")) return "pending_action";
  if (events.some((e) => e.type === "artifact_downloaded")) return "downloaded";
  if (events.some((e) => e.type === "artifact_viewed")) return "viewed";
  if (events.some((e) => e.type === "delivery_opened")) return "opened";
  if (events.some((e) => e.type === "release_ready")) return "released";
  return "released";
}

export function summarizeTracking(events: DeliveryTrackingEvent[]) {
  const last = events.length > 0 ? events[events.length - 1] : undefined;
  return {
    opened: events.some((e) => e.type === "delivery_opened"),
    downloaded: events.some((e) => e.type === "artifact_downloaded"),
    viewed: events.some((e) => e.type === "artifact_viewed"),
    pendingAction: events.some((e) => e.type === "pending_action"),
    failed: events.some((e) => e.type === "delivery_failed"),
    lastEventAt: last?.timestamp,
  };
}

export function recordDeliveryTrackingEvent(input: RecordTrackingInput): DeliveryTrackingEvent {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");

  const event = appendDeliveryTrackingEvent({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    type: input.type,
    actorId: input.actorId,
    artifactKind: input.artifactKind,
    meta: input.meta,
  });

  if (input.type === "delivery_failed") {
    emitDeliveryOpsNotification({ session, kind: "failed_delivery" });
  }
  if (input.type === "pending_action") {
    emitDeliveryOpsNotification({
      session,
      kind: "recovery_available",
      message: "客户侧有待处理操作",
    });
  }

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.actorId ?? "customer",
    step: "status_transition",
    statusBefore: session.status,
    statusAfter: session.status,
    message: `delivery_tracking:${input.type}`,
    meta: { trackingType: input.type, artifactKind: input.artifactKind, readOnly: true },
  });

  return event;
}

export function getDeliveryTrackingSummary(sessionId: string) {
  const events = listDeliveryTrackingEvents(sessionId);
  return {
    events,
    packageStatus: derivePackageStatus(events),
    summary: summarizeTracking(events),
  };
}

export function seedReleaseReadyTracking(input: {
  sessionId: string;
  organizationId: string;
  actorId?: string;
}): DeliveryTrackingEvent {
  return appendDeliveryTrackingEvent({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    type: "release_ready",
    actorId: input.actorId,
  });
}
