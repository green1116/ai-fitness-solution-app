/**
 * Product P4 — Survey types
 */

import type { SURVEY_STATUSES } from "../questionnaire/questionnaire.constants";

export type SurveyStatus = (typeof SURVEY_STATUSES)[number];
export type SurveyMetadata = Record<string, unknown>;

export type SurveyResponse = {
  id: string;
  questionnaireId: string;
  respondent: string;
  status: SurveyStatus;
  responseCount: number;
  detail: string;
  metadata: SurveyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type SubmitSurveyInput = {
  id?: string;
  questionnaireId: string;
  respondent: string;
  responseCount: number;
  metadata?: SurveyMetadata;
};

export type UpdateSurveyStatusInput = {
  surveyId: string;
  status: SurveyStatus;
};
