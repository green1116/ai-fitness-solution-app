/**
 * V81 — Delivery ops notification hooks
 */

import { recordPilotTelemetry } from "@/lib/portal/v62/store/pilot-telemetry.store";

import { buildIntakeRollbackIndex, listIntakeAudit } from "@/lib/pilot/v80";

import { appendDeliveryOpsNotification } from "./ops.store";
import type { DeliveryOpsNotification, DeliveryOpsNotificationKind } from "./ops.types";
import type { TenderIntakeSession } from "@/lib/pilot/v80";

const MESSAGES: Record<DeliveryOpsNotificationKind, string> = {
  release_ready: "发布包已就绪，可进行客户交付",
  failed_delivery: "交付失败，需运营介入",
  recovery_available: "存在可恢复点，需评估后操作",
  admin_restore_only: "已发布 — 仅管理员可通过 explicitRecovery 恢复",
};

export function emitDeliveryOpsNotification(input: {
  session: TenderIntakeSession;
  kind: DeliveryOpsNotificationKind;
  message?: string;
  meta?: Record<string, unknown>;
}): DeliveryOpsNotification {
  const notification = appendDeliveryOpsNotification({
    sessionId: input.session.id,
    organizationId: input.session.organizationId,
    kind: input.kind,
    message: input.message ?? MESSAGES[input.kind],
    readOnly: true,
    meta: input.meta,
  });

  if (input.kind === "release_ready") {
    recordPilotTelemetry({
      name: "delivery_opened",
      organizationId: input.session.organizationId,
      projectId: input.session.productionProjectId,
      success: true,
      meta: { sessionId: input.session.id, releasePackageId: input.session.releasePackageId },
    });
  }

  return notification;
}

export function syncDeliveryOpsNotifications(session: TenderIntakeSession): DeliveryOpsNotification[] {
  const emitted: DeliveryOpsNotification[] = [];

  if (session.signedOff) {
    emitted.push(
      emitDeliveryOpsNotification({
        session,
        kind: "release_ready",
        meta: { releasePackageId: session.releasePackageId },
      }),
    );
    emitted.push(
      emitDeliveryOpsNotification({
        session,
        kind: "admin_restore_only",
        meta: { explicitRecoveryRequired: true },
      }),
    );
  }

  if (session.workflowStatus === "failed") {
    emitted.push(
      emitDeliveryOpsNotification({
        session,
        kind: "failed_delivery",
      }),
    );
  }

  const audit = listIntakeAudit(session.id);
  const rollback = buildIntakeRollbackIndex(session, audit);
  if (rollback.some((r) => r.available && !r.requiresExplicitAdmin)) {
    emitted.push(
      emitDeliveryOpsNotification({
        session,
        kind: "recovery_available",
        meta: { entryPoints: rollback.filter((r) => r.available).map((r) => r.id) },
      }),
    );
  }

  return emitted;
}
