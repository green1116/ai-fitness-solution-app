/**
 * V80 Pilot P6 — Gap/ambiguity detection, questions, answer merge (no new engine)
 */

import { randomUUID } from "node:crypto";

import { appendIntakeAudit } from "./audit-trail.service";
import { itemNeedsEvidenceConfirmation } from "./confidence.service";
import type {
  ClarificationGap,
  ClarificationMergeTarget,
  ClarificationQuestion,
  ClarificationRequirementListKey,
  ClarificationState,
} from "./clarification.schema";
import { isIntakeSessionFrozen } from "./freeze-lock.service";
import {
  getIntakeSession,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";
import type { RequirementItem, TenderRequirements } from "./requirements.schema";
import {
  parseTenderRequirements,
  validateTenderRequirementsForApproval,
  type RequirementValidationResult,
} from "./requirements.validation";

const AMBIGUOUS_RE = /待定|暂无|未知|TBD|N\/A|大约|左右|等\b|待确认|暂缺/i;

function gapId(kind: string, path: string): string {
  return `gap:${kind}:${path}`;
}

function questionId(gapIdValue: string, round: number): string {
  return `q:${gapIdValue}:r${round}`;
}

/** Detect missing / ambiguous / incomplete fields in current requirements. */
export function detectRequirementGaps(
  requirements: TenderRequirements,
): ClarificationGap[] {
  const gaps: ClarificationGap[] = [];

  if (!requirements.projectName.trim()) {
    gaps.push({
      id: gapId("missing", "projectName"),
      kind: "missing",
      fieldPath: "projectName",
      severity: "blocking",
      message: "缺少项目名称",
    });
  }
  if (!requirements.organization.trim()) {
    gaps.push({
      id: gapId("missing", "organization"),
      kind: "missing",
      fieldPath: "organization",
      severity: "blocking",
      message: "缺少招标单位",
    });
  }
  if (!requirements.location.trim()) {
    gaps.push({
      id: gapId("missing", "location"),
      kind: "missing",
      fieldPath: "location",
      severity: "blocking",
      message: "缺少建设地点",
    });
  }
  if (!requirements.scope.trim() && requirements.objectives.every((o) => !o.trim())) {
    gaps.push({
      id: gapId("missing", "scope"),
      kind: "missing",
      fieldPath: "scope",
      severity: "blocking",
      message: "缺少项目范围或目标描述",
    });
  }

  const hasBudget =
    requirements.budget.min !== undefined ||
    requirements.budget.max !== undefined ||
    Boolean(requirements.budget.notes?.trim());
  if (!hasBudget) {
    gaps.push({
      id: gapId("missing", "budget"),
      kind: "missing",
      fieldPath: "budget.notes",
      severity: "advisory",
      message: "预算信息缺失",
    });
  }

  if (!requirements.schedule.deadline?.trim()) {
    gaps.push({
      id: gapId("missing", "schedule.deadline"),
      kind: "missing",
      fieldPath: "schedule.deadline",
      severity: "advisory",
      message: "缺少投标/交付截止时间",
    });
  }

  const techCount =
    requirements.technicalRequirements.filter((i) => i.text.trim()).length +
    requirements.functionalRequirements.filter((i) => i.text.trim()).length;
  if (techCount === 0) {
    gaps.push({
      id: gapId("missing", "technicalRequirements"),
      kind: "missing",
      fieldPath: "technicalRequirements",
      severity: "blocking",
      message: "缺少技术或功能需求条目",
    });
  }

  const itemLists: Array<{ key: string; items: RequirementItem[] }> = [
    { key: "functionalRequirements", items: requirements.functionalRequirements },
    { key: "technicalRequirements", items: requirements.technicalRequirements },
    { key: "equipment", items: requirements.equipment },
    { key: "space", items: requirements.space },
    { key: "constraints", items: requirements.constraints },
    { key: "optionalItems", items: requirements.optionalItems },
  ];

  for (const list of itemLists) {
    for (const item of list.items) {
      if (!item.text.trim()) continue;
      if (AMBIGUOUS_RE.test(item.text)) {
        gaps.push({
          id: gapId("ambiguous", `${list.key}:${item.id}`),
          kind: "ambiguous",
          fieldPath: `${list.key}.${item.id}`,
          severity: "blocking",
          message: `表述含糊：${item.text.slice(0, 48)}`,
          relatedItemIds: [item.id],
        });
      }
      if (itemNeedsEvidenceConfirmation(item) && item.reviewStatus !== "confirmed") {
        gaps.push({
          id: gapId("low_confidence", `${list.key}:${item.id}`),
          kind: "low_confidence",
          fieldPath: `${list.key}.${item.id}`,
          severity: "advisory",
          message: `低置信度/缺证据待澄清：${item.text.slice(0, 40)}`,
          relatedItemIds: [item.id],
        });
      }
    }
  }

  // Equipment without quantity cue
  for (const item of requirements.equipment) {
    if (!item.text.trim()) continue;
    if (!/\d+|不少于|不少于|台|套|件|个/.test(item.text)) {
      gaps.push({
        id: gapId("incomplete", `equipment:${item.id}`),
        kind: "incomplete",
        fieldPath: `equipment.${item.id}`,
        severity: "advisory",
        message: `设备条目缺少数量：${item.text.slice(0, 40)}`,
        relatedItemIds: [item.id],
      });
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return gaps.filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
}

function targetForGap(gap: ClarificationGap): ClarificationMergeTarget {
  if (gap.fieldPath === "projectName") return { type: "scalar", key: "projectName" };
  if (gap.fieldPath === "organization") return { type: "scalar", key: "organization" };
  if (gap.fieldPath === "location") return { type: "scalar", key: "location" };
  if (gap.fieldPath === "scope") return { type: "scalar", key: "scope" };
  if (gap.fieldPath === "budget.notes" || gap.fieldPath === "budget") {
    return { type: "budget", key: "notes" };
  }
  if (gap.fieldPath === "schedule.deadline") return { type: "schedule", key: "deadline" };
  if (gap.fieldPath === "technicalRequirements") {
    return {
      type: "requirement_item",
      listKey: "technicalRequirements",
      mode: "append",
    };
  }

  const itemMatch = gap.fieldPath.match(
    /^(functionalRequirements|technicalRequirements|equipment|space|quantity|constraints|compliance|standards|evaluation|optionalItems)\.(.+)$/,
  );
  if (itemMatch) {
    return {
      type: "requirement_item",
      listKey: itemMatch[1] as ClarificationRequirementListKey,
      itemId: itemMatch[2],
      mode: "patch_text",
    };
  }

  return { type: "scalar", key: "scope" };
}

function questionTextForGap(gap: ClarificationGap): string {
  switch (gap.kind) {
    case "missing":
      if (gap.fieldPath === "projectName") return "请提供正式项目名称？";
      if (gap.fieldPath === "organization") return "请确认招标单位全称？";
      if (gap.fieldPath === "location") return "请确认建设地点（城市/园区）？";
      if (gap.fieldPath === "scope") return "请简要说明项目建设范围与目标？";
      if (gap.fieldPath.startsWith("budget")) return "请提供预算区间或限价说明？";
      if (gap.fieldPath === "schedule.deadline") return "请提供投标或交付截止时间？";
      if (gap.fieldPath === "technicalRequirements")
        return "请补充至少一条关键技术/功能需求？";
      return `请补充缺失信息（${gap.fieldPath}）？`;
    case "ambiguous":
      return `以下表述含糊，请给出明确要求：${gap.message.replace(/^表述含糊：/, "")}`;
    case "incomplete":
      return `请补充完整信息：${gap.message}`;
    case "low_confidence":
      return `抽取置信度较低，请确认或纠正：${gap.message.replace(/^低置信度\/缺证据待澄清：/, "")}`;
    default:
      return gap.message;
  }
}

/** Generate clarification questions from gaps for a given round. */
export function generateClarificationQuestions(
  gaps: ClarificationGap[],
  round: number,
  existing: ClarificationQuestion[] = [],
): ClarificationQuestion[] {
  const kept = existing.filter(
    (q) => q.status === "answered" || q.status === "skipped",
  );
  const openGapIds = new Set(
    existing.filter((q) => q.status === "open").map((q) => q.gapId),
  );

  const next: ClarificationQuestion[] = [...kept];
  for (const gap of gaps) {
    // Skip if already answered/skipped for same gap
    if (kept.some((q) => q.gapId === gap.id)) continue;
    // Keep existing open question for same gap
    const openExisting = existing.find((q) => q.gapId === gap.id && q.status === "open");
    if (openExisting) {
      if (!next.some((q) => q.id === openExisting.id)) next.push(openExisting);
      continue;
    }
    if (openGapIds.has(gap.id)) continue;

    next.push({
      id: questionId(gap.id, round),
      gapId: gap.id,
      fieldPath: gap.fieldPath,
      question: questionTextForGap(gap),
      suggestedTarget: targetForGap(gap),
      status: "open",
      severity: gap.severity,
      round,
    });
  }
  return next;
}

export function mergeClarificationAnswerIntoRequirements(
  requirements: TenderRequirements,
  target: ClarificationMergeTarget,
  answer: string,
): TenderRequirements {
  const text = answer.trim();
  if (!text) return requirements;

  if (target.type === "scalar") {
    return { ...requirements, [target.key]: text };
  }
  if (target.type === "budget") {
    if (target.key === "notes") {
      return {
        ...requirements,
        budget: { ...requirements.budget, notes: text },
      };
    }
    const num = Number(text.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(num)) {
      return {
        ...requirements,
        budget: { ...requirements.budget, notes: text },
      };
    }
    return {
      ...requirements,
      budget: { ...requirements.budget, [target.key]: num },
    };
  }
  if (target.type === "schedule") {
    return {
      ...requirements,
      schedule: { ...requirements.schedule, deadline: text },
    };
  }
  if (target.type === "string_list") {
    const prev = requirements[target.key] ?? [];
    return {
      ...requirements,
      [target.key]:
        target.mode === "replace"
          ? text.split(/[\n；;]/).map((s) => s.trim()).filter(Boolean)
          : [...prev, ...text.split(/[\n；;]/).map((s) => s.trim()).filter(Boolean)],
    };
  }

  // requirement_item
  const list = [...(requirements[target.listKey] ?? [])];
  if (target.mode === "append" || !target.itemId) {
    list.push({
      id: `clarify_${randomUUID().slice(0, 8)}`,
      text,
      priority: "must",
      reviewStatus: "pending",
      confidence: 1,
      confidenceBand: "high",
      evidenceOverride: true,
      evidenceOverrideNote: "来自澄清回答",
    });
    return { ...requirements, [target.listKey]: list };
  }

  const idx = list.findIndex((i) => i.id === target.itemId);
  if (idx < 0) {
    list.push({
      id: target.itemId,
      text,
      priority: "must",
      reviewStatus: "pending",
      confidence: 1,
      confidenceBand: "high",
    });
  } else {
    list[idx] = {
      ...list[idx]!,
      text,
      reviewStatus: "pending",
      confidence: Math.max(list[idx]!.confidence ?? 0, 0.85),
      confidenceBand: "high",
      evidenceOverride: true,
      evidenceOverrideNote: "澄清后更新",
    };
  }
  return { ...requirements, [target.listKey]: list };
}

export function listOpenBlockingClarifications(
  state: ClarificationState | undefined,
): ClarificationQuestion[] {
  if (!state) return [];
  return state.questions.filter((q) => q.status === "open" && q.severity === "blocking");
}

export function assertClarificationsResolved(session: TenderIntakeSession): void {
  const open = listOpenBlockingClarifications(session.clarifications);
  if (open.length > 0) {
    const err = new Error("CLARIFICATION_REQUIRED");
    (err as Error & { questions: ClarificationQuestion[] }).questions = open;
    throw err;
  }
}

function assertMutable(session: TenderIntakeSession): void {
  if (session.signedOff) throw new Error("RELEASE_LOCKED");
  if (isIntakeSessionFrozen(session) || session.status === "ready") {
    throw new Error("SESSION_FROZEN");
  }
  if (session.status === "approving" || session.status === "generating") {
    throw new Error("SESSION_LOCKED");
  }
  if (session.status === "approved") throw new Error("ALREADY_APPROVED");
}

export type RunClarificationResult = {
  session: TenderIntakeSession;
  clarifications: ClarificationState;
  validation: RequirementValidationResult;
};

/** Detect gaps and (re)generate open questions — bumps round when new gaps appear. */
export function runClarificationDetection(input: {
  sessionId: string;
  organizationId: string;
  actorId?: string;
}): RunClarificationResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  assertMutable(session);

  const requirements = parseTenderRequirements(
    session.requirements ?? session.extractedRequirements ?? {},
  );
  const gaps = detectRequirementGaps(requirements);
  const prev = session.clarifications;
  const prevRound = prev?.round ?? 0;
  const newGapIds = gaps
    .map((g) => g.id)
    .filter((id) => !(prev?.gaps ?? []).some((g) => g.id === id));
  const round = newGapIds.length > 0 || !prev ? prevRound + 1 : prevRound || 1;
  const questions = generateClarificationQuestions(gaps, round, prev?.questions ?? []);

  const clarifications: ClarificationState = {
    round,
    gaps,
    questions,
    updatedAt: new Date().toISOString(),
  };

  const updated = updateIntakeSession(input.sessionId, {
    status: session.status === "extracted" ? "in_review" : session.status,
    clarifications,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "clarify",
    statusBefore: session.status,
    statusAfter: updated.status,
    message: `澄清检测第 ${round} 轮：${gaps.length} 缺口 / ${questions.filter((q) => q.status === "open").length} 待答`,
    meta: {
      round,
      gapCount: gaps.length,
      openCount: questions.filter((q) => q.status === "open").length,
      blockingOpen: listOpenBlockingClarifications(clarifications).length,
    },
  });

  return {
    session: updated,
    clarifications,
    validation: validateTenderRequirementsForApproval(requirements),
  };
}

export type AnswerClarificationResult = RunClarificationResult & {
  requirements: TenderRequirements;
  revision: number;
};

/** Collect answer, merge into requirements, re-validate, audit. */
export function answerClarificationQuestion(input: {
  sessionId: string;
  organizationId: string;
  questionId: string;
  answer: string;
  actorId?: string;
}): AnswerClarificationResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  assertMutable(session);

  const state = session.clarifications;
  if (!state) throw new Error("NO_CLARIFICATION_STATE");

  const qIndex = state.questions.findIndex((q) => q.id === input.questionId);
  if (qIndex < 0) throw new Error("QUESTION_NOT_FOUND");
  const question = state.questions[qIndex]!;
  if (question.status === "answered") {
    // Idempotent: same answer short-circuit
    const requirements = parseTenderRequirements(
      session.requirements ?? session.extractedRequirements ?? {},
    );
    return {
      session,
      clarifications: state,
      requirements,
      validation: validateTenderRequirementsForApproval(requirements),
      revision: session.requirementsRevision ?? 0,
    };
  }

  const answer = input.answer.trim();
  if (!answer) throw new Error("ANSWER_REQUIRED");

  const base = parseTenderRequirements(
    session.requirements ?? session.extractedRequirements ?? {},
  );
  const mergedReq = parseTenderRequirements(
    mergeClarificationAnswerIntoRequirements(base, question.suggestedTarget, answer),
  );
  const revision = (session.requirementsRevision ?? 0) + 1;

  const questions = [...state.questions];
  questions[qIndex] = {
    ...question,
    status: "answered",
    answer,
    answeredAt: new Date().toISOString(),
    answeredBy: input.actorId ?? session.userId,
  };

  // Re-detect after merge — keep answered history, refresh gaps/open qs
  const gaps = detectRequirementGaps(mergedReq);
  const nextRound = state.round;
  const refreshed = generateClarificationQuestions(gaps, nextRound, questions);
  const clarifications: ClarificationState = {
    round: nextRound,
    gaps,
    questions: refreshed,
    updatedAt: new Date().toISOString(),
  };

  const updated = updateIntakeSession(input.sessionId, {
    status: "in_review",
    requirements: mergedReq,
    requirementsRevision: revision,
    clarifications,
  });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  const validation = validateTenderRequirementsForApproval(mergedReq);

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "clarify",
    statusBefore: session.status,
    statusAfter: "in_review",
    message: `澄清作答：${question.question.slice(0, 40)}`,
    requirementsSnapshot: mergedReq,
    diff: {
      questionId: question.id,
      fieldPath: question.fieldPath,
      answer: answer.slice(0, 200),
    },
    meta: {
      round: nextRound,
      questionId: question.id,
      gapId: question.gapId,
      revision,
      valid: validation.valid,
      action: "answer",
    },
  });

  return {
    session: updated,
    clarifications,
    requirements: mergedReq,
    validation,
    revision,
  };
}

export function skipClarificationQuestion(input: {
  sessionId: string;
  organizationId: string;
  questionId: string;
  actorId?: string;
  /** Advisory may be skipped freely; blocking requires explicit flag */
  forceBlocking?: boolean;
}): RunClarificationResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  assertMutable(session);

  const state = session.clarifications;
  if (!state) throw new Error("NO_CLARIFICATION_STATE");

  const qIndex = state.questions.findIndex((q) => q.id === input.questionId);
  if (qIndex < 0) throw new Error("QUESTION_NOT_FOUND");
  const question = state.questions[qIndex]!;

  if (question.severity === "blocking" && !input.forceBlocking) {
    throw new Error("BLOCKING_SKIP_NOT_ALLOWED");
  }

  const questions = [...state.questions];
  questions[qIndex] = {
    ...question,
    status: "skipped",
    answeredAt: new Date().toISOString(),
    answeredBy: input.actorId ?? session.userId,
  };

  const clarifications: ClarificationState = {
    ...state,
    questions,
    updatedAt: new Date().toISOString(),
  };

  const requirements = parseTenderRequirements(
    session.requirements ?? session.extractedRequirements ?? {},
  );
  const updated = updateIntakeSession(input.sessionId, { clarifications });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "clarify",
    statusBefore: session.status,
    statusAfter: updated.status,
    message: `跳过澄清：${question.question.slice(0, 40)}`,
    meta: {
      round: state.round,
      questionId: question.id,
      action: "skip",
      severity: question.severity,
    },
  });

  return {
    session: updated,
    clarifications,
    validation: validateTenderRequirementsForApproval(requirements),
  };
}

export function getClarificationSnapshot(sessionId: string): ClarificationState | null {
  return getIntakeSession(sessionId)?.clarifications ?? null;
}
