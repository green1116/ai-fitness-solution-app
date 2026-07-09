/**
 * V80 Pilot P5 — Intake history & traceability view
 */

import {
  buildIntakeLinkage,
  getIntakeDeliverySnapshot,
} from "./artifact-delivery.service";
import { getIntakeFreezeSnapshot, isIntakeSessionFrozen } from "./freeze-lock.service";
import { listIntakeAudit, type IntakeAuditEntry } from "./audit-trail.service";
import { getIntakeSession, type TenderIntakeSession } from "./intake.store";
import type { TenderRequirements } from "./requirements.schema";

export type IntakeRequirementRevision = {
  auditEntryId: string;
  step: IntakeAuditEntry["step"];
  timestamp: string;
  actorId: string;
  projectName?: string;
  valid?: boolean;
};

export type IntakeHistorySnapshot = {
  session: {
    id: string;
    status: TenderIntakeSession["status"];
    tenderIntakeId: string;
    fileName: string;
    workflowStatus?: string;
    updatedAt: string;
  };
  traceability: ReturnType<typeof buildIntakeLinkage>;
  timeline: IntakeAuditEntry[];
  revisions: IntakeRequirementRevision[];
  canRecover: boolean;
  canRetry: boolean;
  deliveryLock?: ReturnType<typeof getIntakeFreezeSnapshot>;
  lastFailure?: { message: string; step?: string; auditEntryId?: string };
};

function findLastFailure(entries: IntakeAuditEntry[]): IntakeHistorySnapshot["lastFailure"] {
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i]!;
    if (entry.step === "generate" || entry.step === "retry") {
      if (entry.workflowStatusAfter === "failed" || entry.meta?.workflowStatus === "failed") {
        return {
          message: String(entry.message ?? entry.meta?.error ?? "生成失败"),
          step: entry.meta?.failedStep ? String(entry.meta.failedStep) : undefined,
          auditEntryId: entry.id,
        };
      }
    }
    if (entry.meta?.valid === false && entry.step === "validate") {
      return {
        message: "校验未通过",
        auditEntryId: entry.id,
      };
    }
  }
  return undefined;
}

export async function getIntakeHistory(
  sessionId: string,
  organizationId: string,
): Promise<IntakeHistorySnapshot | null> {
  const session = getIntakeSession(sessionId);
  if (!session || session.organizationId !== organizationId) return null;

  const timeline = listIntakeAudit(sessionId);
  const revisions: IntakeRequirementRevision[] = timeline
    .filter((e) => e.requirementsSnapshot)
    .map((e) => ({
      auditEntryId: e.id,
      step: e.step,
      timestamp: e.timestamp,
      actorId: e.actorId,
      projectName: e.requirementsSnapshot?.projectName,
      valid: e.meta?.valid === true ? true : e.meta?.valid === false ? false : undefined,
    }));

  let delivery: Awaited<ReturnType<typeof getIntakeDeliverySnapshot>> | null = null;
  if (session.productionProjectId) {
    try {
      delivery = await getIntakeDeliverySnapshot(session, organizationId);
    } catch {
      delivery = null;
    }
  }

  const canRetry =
    !isIntakeSessionFrozen(session) &&
    Boolean(session.productionProjectId) &&
    (session.status === "generating" ||
      session.workflowStatus === "failed" ||
      delivery?.canRetry === true);

  const canRecover =
    !isIntakeSessionFrozen(session) &&
    session.status !== "approving" &&
    revisions.length > 0 &&
    session.status !== "approved" &&
    session.status !== "ready";

  return {
    session: {
      id: session.id,
      status: session.status,
      tenderIntakeId: session.tenderIntakeId,
      fileName: session.fileName,
      workflowStatus: session.workflowStatus,
      updatedAt: session.updatedAt,
    },
    traceability: {
      ...buildIntakeLinkage(session),
      ...(delivery
        ? {
            documentCenterUrl: delivery.documentCenterUrl,
            artifactCount: delivery.artifacts.length,
          }
        : {}),
    },
    timeline,
    revisions,
    canRecover,
    canRetry,
    deliveryLock: getIntakeFreezeSnapshot(session),
    lastFailure: findLastFailure(timeline),
  };
}

export function findLastValidReviewEntry(sessionId: string): IntakeAuditEntry | null {
  const entries = listIntakeAudit(sessionId);
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i]!;
    if (entry.step === "validate" && entry.meta?.valid === true && entry.requirementsSnapshot) {
      return entry;
    }
  }
  return null;
}

export function cloneRequirementsSnapshot(req: TenderRequirements): TenderRequirements {
  return JSON.parse(JSON.stringify(req)) as TenderRequirements;
}
