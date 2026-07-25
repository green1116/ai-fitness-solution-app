/**
 * Product P4 — Questionnaire types + readiness / manifest
 */

import type {
  P4_MANAGER_STATUSES,
  P4_READINESS_VERDICTS,
  PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
  PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
  PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
  QUESTIONNAIRE_STATUSES,
} from "./questionnaire.constants";

export type QuestionnaireStatus = (typeof QUESTIONNAIRE_STATUSES)[number];
export type P4ReadinessVerdict = (typeof P4_READINESS_VERDICTS)[number];
export type P4ManagerStatus = (typeof P4_MANAGER_STATUSES)[number];
export type CollectionMetadata = Record<string, unknown>;

export type Questionnaire = {
  id: string;
  projectRef: string;
  title: string;
  status: QuestionnaireStatus;
  questionCount: number;
  detail: string;
  metadata: CollectionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterQuestionnaireInput = {
  id?: string;
  projectRef: string;
  title: string;
  questionCount: number;
  metadata?: CollectionMetadata;
};

export type UpdateQuestionnaireStatusInput = {
  questionnaireId: string;
  status: QuestionnaireStatus;
};

export type P4ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P4ReadinessResult = {
  verdict: P4ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P4ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P4RegistryManifest = {
  foundationId: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_ID;
  version: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION;
  freezeVersion: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION;
  base: typeof PRODUCT_P4_REQUIREMENT_COLLECTION_BASE;
  questionnaireCount: number;
  surveyCount: number;
  stakeholderCount: number;
  constraintCount: number;
  spaceAnalysisCount: number;
  equipmentPreferenceCount: number;
  budgetTargetCount: number;
  validationCount: number;
};
