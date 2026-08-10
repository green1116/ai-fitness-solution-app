/**
 * V80 Pilot P2 — Review / revision / re-extract loop
 */

import { extractRequirementsFromParsedTender } from "./extract.service";
import { appendIntakeAudit, diffRequirements } from "./audit-trail.service";
import { isIntakeSessionFrozen } from "./freeze-lock.service";
import {
  getIntakeSession,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";
import { consolidateIntakeSession } from "./multidoc.service";
import type {
  RequirementItem,
  RequirementItemListKey,
  RequirementReviewStatus,
  TenderRequirements,
} from "./requirements.schema";
import {
  mergeTenderRequirements,
  parseTenderRequirements,
  validateTenderRequirementsForApproval,
  type RequirementValidationResult,
} from "./requirements.validation";

export type { RequirementItemListKey };

export type PatchIntakeResult = {
  session: TenderIntakeSession;
  requirements: TenderRequirements;
  validation: RequirementValidationResult;
  revision: number;
};

function assertSessionAccess(
  sessionId: string,
  organizationId: string,
): TenderIntakeSession {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (session.signedOff) throw new Error("RELEASE_LOCKED");
  if (isIntakeSessionFrozen(session)) throw new Error("SESSION_FROZEN");
  if (session.status === "approved") throw new Error("ALREADY_APPROVED");
  if (session.status === "ready") throw new Error("SESSION_FROZEN");
  if (session.status === "approving" || session.status === "generating") {
    throw new Error("SESSION_LOCKED");
  }
  return session;
}

function nextRevision(session: TenderIntakeSession): number {
  return (session.requirementsRevision ?? 0) + 1;
}

function stampPendingItems(req: TenderRequirements): TenderRequirements {
  const stamp = (items: RequirementItem[]): RequirementItem[] =>
    items.map((item) => ({
      ...item,
      reviewStatus: item.reviewStatus ?? "pending",
    }));

  return {
    ...req,
    functionalRequirements: stamp(req.functionalRequirements),
    technicalRequirements: stamp(req.technicalRequirements),
    equipment: stamp(req.equipment),
    space: stamp(req.space),
    quantity: stamp(req.quantity),
    constraints: stamp(req.constraints),
    compliance: stamp(req.compliance),
    standards: stamp(req.standards),
    evaluation: stamp(req.evaluation),
    optionalItems: stamp(req.optionalItems),
  };
}

export function patchIntakeRequirements(input: {
  sessionId: string;
  organizationId: string;
  requirements: Partial<TenderRequirements> | TenderRequirements;
  actorId?: string;
}): PatchIntakeResult {
  const session = assertSessionAccess(input.sessionId, input.organizationId);
  const base =
    session.requirements ??
    session.extractedRequirements ??
    parseTenderRequirements({});

  const merged = stampPendingItems(
    parseTenderRequirements(mergeTenderRequirements(base, input.requirements)),
  );
  const validation = validateTenderRequirementsForApproval(merged);
  const revision = nextRevision(session);

  const updated = updateIntakeSession(input.sessionId, {
    status: "in_review",
    requirements: merged,
    requirementsRevision: revision,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "patch",
    statusBefore: session.status,
    statusAfter: "in_review",
    message: `编辑需求（v${revision}）`,
    diff: diffRequirements(base, merged),
    requirementsSnapshot: merged,
    meta: {
      valid: validation.valid,
      errorCount: validation.errors.length,
      revision,
    },
  });

  return { session: updated, requirements: merged, validation, revision };
}

export function resetIntakeRequirements(input: {
  sessionId: string;
  organizationId: string;
  actorId?: string;
}): PatchIntakeResult {
  const session = assertSessionAccess(input.sessionId, input.organizationId);
  if (!session.extractedRequirements) {
    throw new Error("NO_EXTRACTED_SNAPSHOT");
  }

  const normalized = stampPendingItems(
    parseTenderRequirements(session.extractedRequirements),
  );
  const validation = validateTenderRequirementsForApproval(normalized);
  const revision = nextRevision(session);

  const updated = updateIntakeSession(input.sessionId, {
    status: "extracted",
    requirements: normalized,
    requirementsRevision: revision,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "reset",
    statusBefore: session.status,
    statusAfter: "extracted",
    message: `重置为抽取结果（v${revision}）`,
    diff: diffRequirements(session.requirements, normalized),
    requirementsSnapshot: normalized,
    meta: { valid: validation.valid, revision },
  });

  return { session: updated, requirements: normalized, validation, revision };
}

export function setRequirementItemReview(input: {
  sessionId: string;
  organizationId: string;
  listKey: RequirementItemListKey;
  itemId: string;
  reviewStatus: RequirementReviewStatus;
  actorId?: string;
}): PatchIntakeResult {
  const session = assertSessionAccess(input.sessionId, input.organizationId);
  const base =
    session.requirements ??
    session.extractedRequirements ??
    parseTenderRequirements({});

  const list = [...(base[input.listKey] ?? [])];
  const index = list.findIndex((item) => item.id === input.itemId);
  if (index < 0) throw new Error("ITEM_NOT_FOUND");

  list[index] = { ...list[index]!, reviewStatus: input.reviewStatus };
  const merged = parseTenderRequirements({ ...base, [input.listKey]: list });
  const validation = validateTenderRequirementsForApproval(merged);
  const revision = nextRevision(session);

  const updated = updateIntakeSession(input.sessionId, {
    status: "in_review",
    requirements: merged,
    requirementsRevision: revision,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "item_review",
    statusBefore: session.status,
    statusAfter: "in_review",
    message: `条目${input.reviewStatus}：${list[index]!.text.slice(0, 48)}`,
    requirementsSnapshot: merged,
    meta: {
      listKey: input.listKey,
      itemId: input.itemId,
      reviewStatus: input.reviewStatus,
      confidence: list[index]!.confidence,
      confidenceBand: list[index]!.confidenceBand,
      evidenceCount: list[index]!.evidence?.length ?? 0,
      revision,
      valid: validation.valid,
    },
  });

  return { session: updated, requirements: merged, validation, revision };
}

export function setRequirementEvidenceOverride(input: {
  sessionId: string;
  organizationId: string;
  listKey: RequirementItemListKey;
  itemId: string;
  evidenceOverride: boolean;
  note?: string;
  actorId?: string;
}): PatchIntakeResult {
  const session = assertSessionAccess(input.sessionId, input.organizationId);
  const base =
    session.requirements ??
    session.extractedRequirements ??
    parseTenderRequirements({});

  const list = [...(base[input.listKey] ?? [])];
  const index = list.findIndex((item) => item.id === input.itemId);
  if (index < 0) throw new Error("ITEM_NOT_FOUND");

  const prev = list[index]!;
  list[index] = {
    ...prev,
    evidenceOverride: input.evidenceOverride,
    evidenceOverrideNote: input.note?.trim() || prev.evidenceOverrideNote,
    // Explicit evidence acknowledgment also confirms the item for the P5 gate
    reviewStatus: input.evidenceOverride
      ? "confirmed"
      : prev.reviewStatus === "confirmed"
        ? "pending"
        : prev.reviewStatus,
  };
  const merged = parseTenderRequirements({ ...base, [input.listKey]: list });
  const validation = validateTenderRequirementsForApproval(merged);
  const revision = nextRevision(session);

  const updated = updateIntakeSession(input.sessionId, {
    status: "in_review",
    requirements: merged,
    requirementsRevision: revision,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "item_review",
    statusBefore: session.status,
    statusAfter: "in_review",
    message: input.evidenceOverride
      ? `证据覆盖确认：${prev.text.slice(0, 48)}`
      : `撤销证据覆盖：${prev.text.slice(0, 48)}`,
    requirementsSnapshot: merged,
    meta: {
      listKey: input.listKey,
      itemId: input.itemId,
      evidenceOverride: input.evidenceOverride,
      evidenceOverrideNote: input.note,
      confidence: prev.confidence,
      confidenceBand: prev.confidenceBand,
      evidenceCount: prev.evidence?.length ?? 0,
      revision,
      valid: validation.valid,
    },
  });

  return { session: updated, requirements: merged, validation, revision };
}

export function bulkSetRequirementItemReview(input: {
  sessionId: string;
  organizationId: string;
  reviewStatus: RequirementReviewStatus;
  actorId?: string;
  /** When true, only update must-priority items that are not rejected */
  mustOnly?: boolean;
}): PatchIntakeResult {
  const session = assertSessionAccess(input.sessionId, input.organizationId);
  const base =
    session.requirements ??
    session.extractedRequirements ??
    parseTenderRequirements({});

  const mapList = (items: RequirementItem[]): RequirementItem[] =>
    items.map((item) => {
      if (input.mustOnly) {
        const priority = item.priority ?? "must";
        if (priority !== "must") return item;
        if (item.reviewStatus === "rejected") return item;
      }
      return { ...item, reviewStatus: input.reviewStatus };
    });

  const merged = parseTenderRequirements({
    ...base,
    functionalRequirements: mapList(base.functionalRequirements),
    technicalRequirements: mapList(base.technicalRequirements),
    equipment: mapList(base.equipment),
    space: mapList(base.space),
    quantity: mapList(base.quantity),
    constraints: mapList(base.constraints),
    compliance: mapList(base.compliance),
    standards: mapList(base.standards),
    evaluation: mapList(base.evaluation),
    optionalItems: mapList(base.optionalItems),
  });

  return patchIntakeRequirements({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    requirements: merged,
    actorId: input.actorId,
  });
}

/**
 * Re-run extraction from cached parseResult / multi-doc registry.
 * mode=replace — overwrite working copy + baseline
 * mode=working_only — overwrite working copy, keep extractedRequirements baseline
 */
export function reExtractIntakeRequirements(input: {
  sessionId: string;
  organizationId: string;
  actorId?: string;
  mode?: "replace" | "working_only";
}): PatchIntakeResult {
  const session = assertSessionAccess(input.sessionId, input.organizationId);
  const mode = input.mode ?? "replace";

  // P7 — multi-doc: re-extract each document and consolidate
  if (session.documents && session.documents.length > 0) {
    updateIntakeSession(input.sessionId, {
      documents: session.documents.map((d) => ({
        ...d,
        requirements: undefined,
        status: "parsed" as const,
      })),
    });
    const result = consolidateIntakeSession({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId,
    });
    if (mode === "working_only" && session.extractedRequirements) {
      updateIntakeSession(input.sessionId, {
        extractedRequirements: session.extractedRequirements,
        requirements: result.requirements,
      });
    }
    appendIntakeAudit({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId ?? session.userId,
      step: "re-extract",
      statusBefore: session.status,
      statusAfter: "extracted",
      message: `多文档重新抽取并合并（v${result.revision}, mode=${mode}）`,
      diff: diffRequirements(session.requirements, result.requirements),
      requirementsSnapshot: result.requirements,
      meta: {
        revision: result.revision,
        mode,
        valid: result.validation.valid,
        reextract: true,
        multiDoc: true,
        documentCount: result.documents.length,
      },
    });
    const updated = getIntakeSession(input.sessionId)!;
    return {
      session: updated,
      requirements: result.requirements,
      validation: result.validation,
      revision: result.revision,
    };
  }

  const extracted = stampPendingItems(
    extractRequirementsFromParsedTender({
      parseResult: session.parseResult,
      sourceName: session.fileName,
    }),
  );
  const normalized = parseTenderRequirements(extracted);
  const validation = validateTenderRequirementsForApproval(normalized);
  const revision = nextRevision(session);

  const updated = updateIntakeSession(input.sessionId, {
    status: "extracted",
    requirements: normalized,
    extractedRequirements:
      mode === "replace" ? normalized : session.extractedRequirements ?? normalized,
    requirementsRevision: revision,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "re-extract",
    statusBefore: session.status,
    statusAfter: "extracted",
    message: `重新抽取（v${revision}, mode=${mode}）`,
    diff: diffRequirements(session.requirements, normalized),
    requirementsSnapshot: normalized,
    meta: { revision, mode, valid: validation.valid, reextract: true },
  });

  return { session: updated, requirements: normalized, validation, revision };
}

export function validateIntakeSession(input: {
  sessionId: string;
  organizationId: string;
  requirements?: TenderRequirements;
  actorId?: string;
}): RequirementValidationResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

  if (isIntakeSessionFrozen(session)) {
    const candidate = session.requirements ?? session.extractedRequirements;
    if (!candidate) {
      return { valid: false, errors: [{ path: "requirements", message: "会话已冻结" }] };
    }
    return validateTenderRequirementsForApproval(candidate);
  }

  const sessionForEdit = assertSessionAccess(input.sessionId, input.organizationId);
  const candidate =
    input.requirements ??
    sessionForEdit.requirements ??
    sessionForEdit.extractedRequirements;
  if (!candidate) {
    const result = {
      valid: false,
      errors: [{ path: "requirements", message: "尚未抽取需求" }],
    };
    appendIntakeAudit({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId ?? sessionForEdit.userId,
      step: "validate",
      statusBefore: sessionForEdit.status,
      statusAfter: sessionForEdit.status,
      message: "校验失败：尚未抽取需求",
      meta: {
        valid: false,
        errors: result.errors,
        revision: sessionForEdit.requirementsRevision ?? 0,
      },
    });
    return result;
  }
  const result = validateTenderRequirementsForApproval(candidate);
  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? sessionForEdit.userId,
    step: "validate",
    statusBefore: sessionForEdit.status,
    statusAfter: sessionForEdit.status,
    message: result.valid ? "校验通过" : "校验未通过",
    requirementsSnapshot: candidate,
    meta: {
      valid: result.valid,
      errors: result.errors,
      revision: sessionForEdit.requirementsRevision ?? 0,
    },
  });
  return result;
}
