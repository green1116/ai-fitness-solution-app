/**
 * Product P4 — Questionnaire registry
 */

import { QUESTIONNAIRE_STATUSES } from "./questionnaire.constants";
import type {
  Questionnaire,
  QuestionnaireStatus,
  RegisterQuestionnaireInput,
  UpdateQuestionnaireStatusInput,
} from "./questionnaire.types";

const questionnaires = new Map<string, Questionnaire>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuestionnaire(q: Questionnaire): Questionnaire {
  return { ...q, metadata: { ...q.metadata } };
}

export function registerQuestionnaire(
  input: RegisterQuestionnaireInput,
): Questionnaire {
  const projectRef = input.projectRef.trim();
  const title = input.title.trim();
  if (!projectRef) throw new Error("questionnaire.projectRef is required");
  if (!title) throw new Error("questionnaire.title is required");
  if (!Number.isFinite(input.questionCount) || input.questionCount < 1) {
    throw new Error("questionnaire.questionCount must be a positive number");
  }

  const id = input.id?.trim() || createId("p4qnr");
  if (questionnaires.has(id)) {
    throw new Error(`questionnaire already exists: ${id}`);
  }

  const now = nowIso();
  const status = QUESTIONNAIRE_STATUSES[0];
  const questionCount = Math.round(input.questionCount);
  const questionnaire: Questionnaire = {
    id,
    projectRef,
    title,
    status,
    questionCount,
    detail: `status=${status} questions=${questionCount}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  questionnaires.set(id, questionnaire);
  return cloneQuestionnaire(questionnaire);
}

export function updateQuestionnaireStatus(
  input: UpdateQuestionnaireStatusInput,
): Questionnaire {
  const questionnaireId = input.questionnaireId.trim();
  if (!questionnaireId) {
    throw new Error("questionnaire.questionnaireId is required");
  }
  if (!(QUESTIONNAIRE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid questionnaire status: ${input.status}`);
  }
  const existing = questionnaires.get(questionnaireId);
  if (!existing) {
    throw new Error(`questionnaire not found: ${questionnaireId}`);
  }

  const updated: Questionnaire = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} questions=${existing.questionCount}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  questionnaires.set(questionnaireId, updated);
  return cloneQuestionnaire(updated);
}

export function getQuestionnaire(id: string): Questionnaire | undefined {
  const q = questionnaires.get(id.trim());
  return q ? cloneQuestionnaire(q) : undefined;
}

export function listQuestionnaires(filter?: {
  projectRef?: string;
  status?: QuestionnaireStatus;
}): Questionnaire[] {
  let result = [...questionnaires.values()];
  if (filter?.projectRef) {
    const pref = filter.projectRef.trim();
    result = result.filter((q) => q.projectRef === pref);
  }
  if (filter?.status) result = result.filter((q) => q.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuestionnaire);
}

export function clearQuestionnaires(): void {
  questionnaires.clear();
}
