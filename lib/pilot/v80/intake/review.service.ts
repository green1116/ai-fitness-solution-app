/**
 * V80 Pilot P2 — Review patch / reset / validate
 */

import {
  getIntakeSession,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";
import { appendIntakeAudit, diffRequirements } from "./audit-trail.service";
import { isIntakeSessionFrozen } from "./freeze-lock.service";
import type { TenderRequirements } from "./requirements.schema";
import {
  mergeTenderRequirements,
  parseTenderRequirements,
  validateTenderRequirementsForApproval,
  type RequirementValidationResult,
} from "./requirements.validation";

export type PatchIntakeResult = {
  session: TenderIntakeSession;
  requirements: TenderRequirements;
  validation: RequirementValidationResult;
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

  const merged = mergeTenderRequirements(base, input.requirements);
  const normalized = parseTenderRequirements(merged);
  const validation = validateTenderRequirementsForApproval(normalized);

  const updated = updateIntakeSession(input.sessionId, {
    status: "in_review",
    requirements: normalized,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "patch",
    statusBefore: session.status,
    statusAfter: "in_review",
    message: "编辑需求",
    diff: diffRequirements(base, normalized),
    requirementsSnapshot: normalized,
    meta: { valid: validation.valid, errorCount: validation.errors.length },
  });

  return { session: updated, requirements: normalized, validation };
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

  const normalized = parseTenderRequirements(session.extractedRequirements);
  const validation = validateTenderRequirementsForApproval(normalized);

  const updated = updateIntakeSession(input.sessionId, {
    status: "extracted",
    requirements: normalized,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "reset",
    statusBefore: session.status,
    statusAfter: "extracted",
    message: "重置为抽取结果",
    diff: diffRequirements(session.requirements, normalized),
    requirementsSnapshot: normalized,
    meta: { valid: validation.valid },
  });

  return { session: updated, requirements: normalized, validation };
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
  const candidate = input.requirements ?? sessionForEdit.requirements ?? sessionForEdit.extractedRequirements;
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
      meta: { valid: false, errors: result.errors },
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
    meta: { valid: result.valid, errors: result.errors },
  });
  return result;
}
