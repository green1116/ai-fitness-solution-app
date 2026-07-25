/**
 * Product P4 — Survey registry
 */

import { SURVEY_STATUSES } from "../questionnaire/questionnaire.constants";
import { getQuestionnaire } from "../questionnaire/questionnaire.registry";
import type {
  SubmitSurveyInput,
  SurveyResponse,
  SurveyStatus,
  UpdateSurveyStatusInput,
} from "./survey.types";

const surveys = new Map<string, SurveyResponse>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSurvey(survey: SurveyResponse): SurveyResponse {
  return { ...survey, metadata: { ...survey.metadata } };
}

export function submitSurvey(input: SubmitSurveyInput): SurveyResponse {
  const questionnaireId = input.questionnaireId.trim();
  const respondent = input.respondent.trim();
  if (!questionnaireId) throw new Error("survey.questionnaireId is required");
  if (!respondent) throw new Error("survey.respondent is required");
  if (!Number.isFinite(input.responseCount) || input.responseCount < 0) {
    throw new Error("survey.responseCount must be a non-negative number");
  }
  if (!getQuestionnaire(questionnaireId)) {
    throw new Error(`questionnaire not found: ${questionnaireId}`);
  }

  const id = input.id?.trim() || createId("p4srv");
  if (surveys.has(id)) {
    throw new Error(`survey already exists: ${id}`);
  }

  const now = nowIso();
  const status = SURVEY_STATUSES[2];
  const responseCount = Math.round(input.responseCount);
  const survey: SurveyResponse = {
    id,
    questionnaireId,
    respondent,
    status,
    responseCount,
    detail: `respondent=${respondent} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  surveys.set(id, survey);
  return cloneSurvey(survey);
}

export function updateSurveyStatus(
  input: UpdateSurveyStatusInput,
): SurveyResponse {
  const surveyId = input.surveyId.trim();
  if (!surveyId) throw new Error("survey.surveyId is required");
  if (!(SURVEY_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid survey status: ${input.status}`);
  }
  const existing = surveys.get(surveyId);
  if (!existing) throw new Error(`survey not found: ${surveyId}`);

  const updated: SurveyResponse = {
    ...existing,
    status: input.status,
    detail: `respondent=${existing.respondent} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  surveys.set(surveyId, updated);
  return cloneSurvey(updated);
}

export function getSurvey(id: string): SurveyResponse | undefined {
  const survey = surveys.get(id.trim());
  return survey ? cloneSurvey(survey) : undefined;
}

export function listSurveys(filter?: {
  questionnaireId?: string;
  status?: SurveyStatus;
}): SurveyResponse[] {
  let result = [...surveys.values()];
  if (filter?.questionnaireId) {
    const qid = filter.questionnaireId.trim();
    result = result.filter((s) => s.questionnaireId === qid);
  }
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSurvey);
}

export function clearSurveys(): void {
  surveys.clear();
}
