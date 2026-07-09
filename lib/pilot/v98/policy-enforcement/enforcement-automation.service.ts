/**
 * V98 — Enforcement automation (minimal write to enforcement cache only)
 */

import { randomUUID } from "node:crypto";

import { retrieveAuditTrail } from "@/lib/pilot/v96";
import { buildComplianceQueue } from "@/lib/pilot/v97";

import {
  appendEnforcementAction,
  getEnforcementRecord,
  getEnforcementRecordByArchive,
  saveEnforcementRecord,
} from "./enforcement-cache";
import { classifyPolicyDue } from "./policy-engine.service";
import type { EnforcementRecord } from "./enforcement.types";

function findComplianceItem(organizationId: string, archiveRecordId: string) {
  const queue = buildComplianceQueue(organizationId);
  return queue.allItems.find((i) => i.archiveRecordId === archiveRecordId) ?? null;
}

function ensureEnforcementRecord(input: {
  organizationId: string;
  archiveRecordId: string;
}): EnforcementRecord {
  const existing = getEnforcementRecordByArchive(
    input.organizationId,
    input.archiveRecordId,
  );
  if (existing) return existing;

  const compliance = findComplianceItem(input.organizationId, input.archiveRecordId);
  if (!compliance) throw new Error("COMPLIANCE_ITEM_NOT_FOUND");

  const policyDue = classifyPolicyDue(input.organizationId, compliance);
  const now = new Date().toISOString();

  const record: EnforcementRecord = {
    id: `enf-${randomUUID()}`,
    organizationId: input.organizationId,
    sessionId: compliance.sessionId,
    archiveRecordId: compliance.archiveRecordId,
    complianceRecordId: compliance.complianceRecordId,
    projectName: compliance.projectName,
    policyDue,
    policyStatus: "pending",
    dueDate: compliance.reviewDueDate,
    nextStep: "待自动执行",
    createdAt: now,
    updatedAt: now,
  };

  return saveEnforcementRecord(record);
}

export function autoAssignReviewer(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  reviewerId?: string;
  reviewerName?: string;
  note?: string;
}): EnforcementRecord {
  const record = ensureEnforcementRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();
  const reviewerId = input.reviewerId ?? "auto-reviewer";
  const reviewerName = input.reviewerName ?? "Auto Compliance Reviewer";

  const updated = saveEnforcementRecord({
    ...record,
    reviewerId,
    reviewerName,
    policyStatus: "enforced",
    nextStep: "审阅人已自动分配",
    enforcedAt: now,
    updatedAt: now,
  });

  appendEnforcementAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "auto_assign_reviewer",
    enforcementRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? `自动分配审阅人: ${reviewerName}`,
    meta: { reviewerId },
  });

  return updated;
}

export function autoMarkDue(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): EnforcementRecord {
  const record = ensureEnforcementRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();

  const updated = saveEnforcementRecord({
    ...record,
    policyStatus: "enforced",
    nextStep: "到期项已标记",
    enforcedAt: now,
    updatedAt: now,
  });

  appendEnforcementAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "auto_mark_due",
    enforcementRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? "自动标记到期",
    meta: { dueDate: record.dueDate },
  });

  return updated;
}

export function autoEnforcementHold(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): EnforcementRecord {
  const record = ensureEnforcementRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();

  const updated = saveEnforcementRecord({
    ...record,
    policyDue: "hold_required",
    policyStatus: "enforced",
    nextStep: "已自动应用 Hold",
    enforcedAt: now,
    updatedAt: now,
  });

  appendEnforcementAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "auto_hold",
    enforcementRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? "自动法律保留",
    meta: { holdAt: now },
  });

  return updated;
}

export function autoEnforcementPurge(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): EnforcementRecord {
  const record = ensureEnforcementRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();

  const updated = saveEnforcementRecord({
    ...record,
    policyDue: "purge_due",
    policyStatus: "completed",
    nextStep: "清除策略已执行",
    enforcedAt: now,
    updatedAt: now,
  });

  appendEnforcementAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "auto_purge",
    enforcementRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? "自动清除标记",
    meta: { purgeAt: now },
  });

  return updated;
}

export function autoRequestExport(input: {
  organizationId: string;
  actorId: string;
  archiveRecordId: string;
  note?: string;
}): { record: EnforcementRecord; auditSnapshot: ReturnType<typeof retrieveAuditTrail> } {
  const record = ensureEnforcementRecord({
    organizationId: input.organizationId,
    archiveRecordId: input.archiveRecordId,
  });
  const now = new Date().toISOString();
  const auditSnapshot = retrieveAuditTrail(input.organizationId, record.sessionId);

  const updated = saveEnforcementRecord({
    ...record,
    policyDue: "export_due",
    policyStatus: "enforced",
    nextStep: "导出已自动请求",
    enforcedAt: now,
    updatedAt: now,
  });

  appendEnforcementAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "auto_request_export",
    enforcementRecordId: updated.id,
    archiveRecordId: updated.archiveRecordId,
    sessionId: updated.sessionId,
    note: input.note ?? "自动请求合规导出",
    meta: { format: "json" },
  });

  return { record: updated, auditSnapshot };
}

export function getEnforcementRecordOrThrow(
  organizationId: string,
  recordId: string,
): EnforcementRecord {
  const record = getEnforcementRecord(organizationId, recordId);
  if (!record) throw new Error("ENFORCEMENT_NOT_FOUND");
  return record;
}
