import type { TENDER_INTELLIGENCE_VERSION } from "../shared/types";

export const PROJECT_SCALE_RUNTIME_VERSION = "v12.0-project-scale-runtime-1" as const;

export type ProjectScaleTier = "small" | "medium" | "large" | "enterprise";

export interface ProjectScale {
  scaleId: string;
  tier: ProjectScaleTier;
  label: string;
  areaSqm: number;
  budgetCny: number;
  requirementCount: number;
  rationale: string;
}

export interface ProjectScaleRuntimePayload {
  version: typeof PROJECT_SCALE_RUNTIME_VERSION;
  intelligenceVersion: typeof TENDER_INTELLIGENCE_VERSION;
  scale: ProjectScale;
  supportedTiers: ProjectScaleTier[];
  summary: string;
}

export const PROJECT_SCALE_TIERS: ProjectScaleTier[] = [
  "small",
  "medium",
  "large",
  "enterprise",
];
