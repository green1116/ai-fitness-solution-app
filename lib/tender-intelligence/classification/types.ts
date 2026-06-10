import type { TENDER_INTELLIGENCE_VERSION } from "../shared/types";

export const PROJECT_CLASSIFICATION_RUNTIME_VERSION =
  "v12.0-project-classification-runtime-1" as const;

export type GymProjectType =
  | "office-gym"
  | "industrial-gym"
  | "campus-gym"
  | "hotel-gym"
  | "government-gym";

export interface ProjectClassification {
  classificationId: string;
  projectType: GymProjectType;
  label: string;
  confidence: number;
  rationale: string;
}

export interface ProjectClassificationRuntimePayload {
  version: typeof PROJECT_CLASSIFICATION_RUNTIME_VERSION;
  intelligenceVersion: typeof TENDER_INTELLIGENCE_VERSION;
  classification: ProjectClassification;
  supportedTypes: GymProjectType[];
  summary: string;
}

export const GYM_PROJECT_TYPES: GymProjectType[] = [
  "office-gym",
  "industrial-gym",
  "campus-gym",
  "hotel-gym",
  "government-gym",
];
