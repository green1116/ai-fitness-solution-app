import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  TenderIntelligenceRuntimeResult,
  TenderIntelligenceStageResult,
} from "../shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildProjectScale } from "./builders";
import type { ProjectScaleRuntimePayload } from "./types";
import { PROJECT_SCALE_RUNTIME_VERSION, PROJECT_SCALE_TIERS } from "./types";

export function validateProjectScaleRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "scale-default";
  const scale = buildProjectScale({ deploymentId });
  return {
    valid:
      PROJECT_SCALE_TIERS.includes(scale.tier) &&
      scale.areaSqm > 0 &&
      scale.budgetCny > 0,
  };
}

export function runProjectScaleRuntime(input?: {
  deploymentId?: string;
}): TenderIntelligenceRuntimeResult<ProjectScaleRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "scale-default";
  const stages: TenderIntelligenceStageResult[] = [];

  const scale = runStage("project-scale", "Project Scale", () => buildProjectScale({ deploymentId }), stages);
  const validation = runStage("scale-validate", "Scale Validation", () => validateProjectScaleRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Project scale validation failed");

  const payload: ProjectScaleRuntimePayload = {
    version: PROJECT_SCALE_RUNTIME_VERSION,
    intelligenceVersion: TENDER_INTELLIGENCE_VERSION,
    scale,
    supportedTiers: [...PROJECT_SCALE_TIERS],
    summary: `project-scale tier=${scale.tier} area=${scale.areaSqm} budget=${scale.budgetCny}`,
  };

  return finalizeRuntime({ domain: "project-scale", deploymentId, stages, payload, summary: payload.summary });
}
