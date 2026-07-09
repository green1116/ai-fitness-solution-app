/**
 * V80 Pilot P5 — Intake recovery without recreating production entities
 */

import { QuoteStatus, TenderStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  appendIntakeAudit,
  diffRequirements,
  getIntakeAuditEntry,
} from "./audit-trail.service";
import {
  cloneRequirementsSnapshot,
  findLastValidReviewEntry,
} from "./history.service";
import { getIntakeSession, updateIntakeSession } from "./intake.store";
import { parseTenderRequirements } from "./requirements.validation";
import type { TenderRequirements } from "./requirements.schema";
import { buildIntakeSyncPackage } from "./sync.service";
import { assertDeliveryUnlocked, isIntakeSessionFrozen } from "./freeze-lock.service";
import { retryIntakeGeneration } from "./generation-retry.service";
import type { ApproveIntakeResult } from "./approve.service";

export type RecoverIntakeAction =
  | "restore_snapshot"
  | "rollback_valid"
  | "retry_generation";

export type RecoverIntakeInput = {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: RecoverIntakeAction;
  auditEntryId?: string;
  /** Explicit admin recovery — required when session is frozen */
  explicitRecovery?: boolean;
};

export type RecoverIntakeResult = {
  sessionId: string;
  action: RecoverIntakeAction;
  requirements: TenderRequirements;
  status: string;
  retry?: ApproveIntakeResult;
};

async function syncRequirementsToExistingEntities(
  session: NonNullable<ReturnType<typeof getIntakeSession>>,
  requirements: TenderRequirements,
  organizationId: string,
): Promise<void> {
  assertDeliveryUnlocked(session, "metadata_sync");
  if (!session.productionProjectId || !session.productionQuoteId || !session.productionTenderId) {
    return;
  }

  const sync = buildIntakeSyncPackage(requirements, organizationId, {
    intakeSessionId: session.id,
    tenderIntakeId: session.tenderIntakeId,
    sourceFile: session.fileName,
    intakeVersion: "v80-pilot-p5",
    recoveredAt: new Date().toISOString(),
  });

  await prisma.quote.update({
    where: { id: session.productionQuoteId },
    data: {
      content: sync.quoteContent as unknown as Prisma.JsonObject,
      status: QuoteStatus.READY,
    },
  });

  await prisma.tender.update({
    where: { id: session.productionTenderId },
    data: {
      metadata: sync.tenderMetadata as unknown as Prisma.JsonObject,
      status:
        session.workflowStatus === "completed" ? TenderStatus.READY : TenderStatus.GENERATING,
    },
  });

  await prisma.project.update({
    where: { id: session.productionProjectId },
    data: {
      name: sync.projectInput.name,
      clientName: sync.projectInput.clientName,
      industry: sync.projectInput.industry,
      city: sync.projectInput.city,
      notes: sync.projectInput.notes,
    },
  });
}

function resolveRestoreSnapshot(
  sessionId: string,
  auditEntryId?: string,
): TenderRequirements {
  if (!auditEntryId) throw new Error("AUDIT_ENTRY_REQUIRED");

  const entry = getIntakeAuditEntry(sessionId, auditEntryId);
  if (!entry?.requirementsSnapshot) throw new Error("SNAPSHOT_NOT_FOUND");

  return cloneRequirementsSnapshot(entry.requirementsSnapshot);
}

export async function recoverIntakeSession(
  input: RecoverIntakeInput,
): Promise<RecoverIntakeResult> {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  if (session.status === "approving") throw new Error("APPROVE_IN_PROGRESS");

  if (session.signedOff && !input.explicitRecovery) {
    throw new Error("RELEASE_LOCKED");
  }

  if (isIntakeSessionFrozen(session) && !input.explicitRecovery) {
    throw new Error("SESSION_FROZEN");
  }

  if (input.action === "retry_generation") {
    assertDeliveryUnlocked(session, "retry_generation");
    const retry = await retryIntakeGeneration({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId,
    });

    const refreshed = getIntakeSession(input.sessionId)!;
    return {
      sessionId: input.sessionId,
      action: input.action,
      requirements: refreshed.requirements ?? parseTenderRequirements({}),
      status: refreshed.status,
      retry,
    };
  }

  if (session.status === "approved" && session.workflowStatus === "completed") {
    throw new Error("SESSION_ALREADY_READY");
  }
  if (session.status === "ready") {
    throw new Error("SESSION_ALREADY_READY");
  }

  const beforeReq = session.requirements;
  let snapshot: TenderRequirements;

  if (input.action === "rollback_valid") {
    const entry = findLastValidReviewEntry(input.sessionId);
    if (!entry?.requirementsSnapshot) throw new Error("NO_VALID_REVIEW_SNAPSHOT");
    snapshot = cloneRequirementsSnapshot(entry.requirementsSnapshot);
  } else {
    snapshot = resolveRestoreSnapshot(input.sessionId, input.auditEntryId);
  }

  const normalized = parseTenderRequirements(snapshot);
  const hasEntities = Boolean(
    session.productionProjectId && session.productionQuoteId && session.productionTenderId,
  );

  const nextStatus = hasEntities
    ? session.workflowStatus === "failed"
      ? "generating"
      : "in_review"
    : "in_review";

  updateIntakeSession(input.sessionId, {
    requirements: normalized,
    status: nextStatus,
  });

  if (hasEntities) {
    const refreshed = getIntakeSession(input.sessionId)!;
    await syncRequirementsToExistingEntities(refreshed, normalized, input.organizationId);
  }

  const auditStep = input.action === "rollback_valid" ? "rollback" : "recover";
  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: auditStep,
    statusBefore: session.status,
    statusAfter: nextStatus,
    workflowStatusBefore: session.workflowStatus,
    message:
      input.action === "rollback_valid"
        ? "恢复：回滚到最后一次有效审核状态"
        : "恢复：还原需求快照",
    diff: diffRequirements(beforeReq, normalized),
    requirementsSnapshot: normalized,
    linkage: {
      projectId: session.productionProjectId,
      quoteId: session.productionQuoteId,
      tenderId: session.productionTenderId,
    },
    meta: {
      action: input.action,
      auditEntryId: input.auditEntryId,
      entitiesRecreated: false,
    },
  });

  return {
    sessionId: input.sessionId,
    action: input.action,
    requirements: normalized,
    status: nextStatus,
  };
}
