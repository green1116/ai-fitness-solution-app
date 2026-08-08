/**
 * V80 Pilot P7 — Completion freeze & delivery lock
 */

import { appendIntakeAudit } from "./audit-trail.service";
import { buildIntakeLinkage } from "./artifact-delivery.service";
import {
  getIntakeSession,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";

export type FreezeReasonCode = "DELIVERY_READY" | "ALREADY_FROZEN";

export type FrozenStateSnapshot = {
  status: TenderIntakeSession["status"];
  workflowStatus?: string;
  intakeSessionId: string;
  tenderIntakeId: string;
  projectId?: string;
  quoteId?: string;
  tenderId?: string;
  v80TenderId?: string;
  v80QuoteId?: string;
  workflowJobId?: string;
  workflowKey: "tender-pack-complete";
  lockedAt: string;
};

export type DeliveryLockSummary = {
  frozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
  freezeReasonCode?: string;
  freezeReasonMessage?: string;
  frozenState?: FrozenStateSnapshot;
  readOnly: boolean;
  deliveryLocked: boolean;
};

export type FreezeIntakeResult = {
  sessionId: string;
  frozen: true;
  idempotent?: true;
  frozenAt: string;
  frozenBy: string;
  freezeReasonCode: FreezeReasonCode;
  deliveryLock: DeliveryLockSummary;
};

export function isIntakeSessionFrozen(
  session: Pick<TenderIntakeSession, "frozen" | "status">,
): boolean {
  return session.frozen === true || session.status === "ready";
}

export function assertSessionMutable(
  session: TenderIntakeSession,
  operation = "mutate",
): void {
  if (isIntakeSessionFrozen(session)) {
    throw new Error(`SESSION_FROZEN:${operation}`);
  }
}

export function assertDeliveryUnlocked(
  session: TenderIntakeSession,
  operation = "delivery_mutation",
): void {
  if (session.frozen || session.deliveryLocked) {
    throw new Error(`DELIVERY_LOCKED:${operation}`);
  }
  if (session.status === "ready" && session.workflowStatus === "completed") {
    throw new Error(`DELIVERY_LOCKED:${operation}`);
  }
}

export function getIntakeFreezeSnapshot(
  session: TenderIntakeSession,
): DeliveryLockSummary {
  const frozen = isIntakeSessionFrozen(session);
  return {
    frozen,
    frozenAt: session.frozenAt,
    frozenBy: session.frozenBy,
    freezeReasonCode: session.freezeReasonCode,
    freezeReasonMessage: session.freezeReasonMessage,
    frozenState: session.frozenState as FrozenStateSnapshot | undefined,
    readOnly: frozen,
    deliveryLocked: frozen || session.deliveryLocked === true,
  };
}

function buildFrozenState(session: TenderIntakeSession): FrozenStateSnapshot {
  const linkage = buildIntakeLinkage(session);
  return {
    status: session.status,
    workflowStatus: session.workflowStatus,
    intakeSessionId: linkage.intakeSessionId,
    tenderIntakeId: linkage.tenderIntakeId,
    projectId: linkage.projectId,
    quoteId: linkage.quoteId,
    tenderId: linkage.tenderId,
    v80TenderId: linkage.v80TenderId,
    v80QuoteId: linkage.v80QuoteId,
    workflowJobId: linkage.workflowJobId,
    workflowKey: "tender-pack-complete",
    lockedAt: new Date().toISOString(),
  };
}

export function freezeIntakeSession(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  reasonCode?: FreezeReasonCode;
  reasonMessage?: string;
}): FreezeIntakeResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

  if (session.frozen) {
    return {
      sessionId: session.id,
      frozen: true,
      idempotent: true,
      frozenAt: session.frozenAt!,
      frozenBy: session.frozenBy!,
      freezeReasonCode: (session.freezeReasonCode as FreezeReasonCode) ?? "ALREADY_FROZEN",
      deliveryLock: getIntakeFreezeSnapshot(session),
    };
  }

  const readyForFreeze =
    session.status === "ready" ||
    (session.workflowStatus === "completed" && Boolean(session.productionProjectId));

  if (!readyForFreeze) {
    throw new Error("NOT_READY_FOR_FREEZE");
  }

  const now = new Date().toISOString();
  const frozenState = buildFrozenState(session);
  const reasonCode = input.reasonCode ?? "DELIVERY_READY";
  const reasonMessage =
    input.reasonMessage ?? "V80 交付完成，intake 已冻结为只读";

  const updated = updateIntakeSession(
    input.sessionId,
    {
      status: "ready",
      frozen: true,
      frozenAt: now,
      frozenBy: input.actorId,
      freezeReasonCode: reasonCode,
      freezeReasonMessage: reasonMessage,
      frozenState: frozenState as unknown as Record<string, unknown>,
      deliveryLocked: true,
      statusReasonCode: reasonCode,
      statusReasonMessage: reasonMessage,
    },
    { bypassFreeze: true },
  );
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: "freeze",
    statusBefore: session.status,
    statusAfter: "ready",
    workflowStatusBefore: session.workflowStatus,
    workflowStatusAfter: session.workflowStatus ?? "completed",
    message: reasonMessage,
    linkage: {
      projectId: frozenState.projectId,
      quoteId: frozenState.quoteId,
      tenderId: frozenState.tenderId,
      v80TenderId: frozenState.v80TenderId,
      v80QuoteId: frozenState.v80QuoteId,
      workflowJobId: frozenState.workflowJobId,
    },
    meta: {
      reasonCode,
      frozenState,
      deliveryLocked: true,
    },
  });

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: "delivery_lock",
    statusBefore: session.status,
    statusAfter: "ready",
    message: "交付产物与工作流状态已锁定",
    meta: { frozenState, idempotent: false },
  });

  return {
    sessionId: session.id,
    frozen: true,
    frozenAt: now,
    frozenBy: input.actorId,
    freezeReasonCode: reasonCode,
    deliveryLock: getIntakeFreezeSnapshot(updated),
  };
}

/** Auto-freeze when generation reaches ready — idempotent */
export function maybeFreezeIntakeOnReady(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
}): FreezeIntakeResult | null {
  const session = getIntakeSession(input.sessionId);
  if (!session) return null;
  if (session.frozen) {
    return {
      sessionId: session.id,
      frozen: true,
      idempotent: true,
      frozenAt: session.frozenAt!,
      frozenBy: session.frozenBy!,
      freezeReasonCode: "ALREADY_FROZEN",
      deliveryLock: getIntakeFreezeSnapshot(session),
    };
  }
  if (
    session.status !== "ready" &&
    session.workflowStatus !== "completed"
  ) {
    return null;
  }
  return freezeIntakeSession({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
  });
}
