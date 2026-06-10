import type { KNOWLEDGE_BASE_VERSION, ReadinessStubMode } from "../shared/types";

export const PROJECT_KNOWLEDGE_RUNTIME_VERSION = "v12.5-project-knowledge-1" as const;

export const GYM_PROJECT_TYPES = [
  "office-gym",
  "industrial-gym",
  "campus-gym",
  "hotel-gym",
  "government-gym",
] as const;

export type GymProjectType = (typeof GYM_PROJECT_TYPES)[number];

export const PROJECT_SCALE_TIERS = [
  "small",
  "medium",
  "large",
  "enterprise",
] as const;

export type ProjectScaleTier = (typeof PROJECT_SCALE_TIERS)[number];

export interface ProjectKnowledgeAsset {
  assetId: string;
  projectType: GymProjectType;
  projectTypeLabel: string;
  scale: ProjectScaleTier;
  typicalBudgetCny: { min: number; max: number; median: number };
  typicalEquipment: string[];
  mode: ReadinessStubMode;
}

export interface ProjectKnowledgeRuntimePayload {
  version: typeof PROJECT_KNOWLEDGE_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  assets: ProjectKnowledgeAsset[];
  assetCount: number;
  summary: string;
}
