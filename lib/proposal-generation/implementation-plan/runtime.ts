import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalRuntimeResult, ProposalStageResult } from "../shared/types";
import { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import {
  buildMilestones,
  buildPhases,
  buildResponsibilities,
  buildTimeline,
} from "./builders";
import type { ImplementationPlanRuntimePayload } from "./types";
import { IMPLEMENTATION_PLAN_RUNTIME_VERSION } from "./types";

export function validateImplementationPlanRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "impl-default";
  return {
    valid:
      buildMilestones({ deploymentId }).length >= 4 &&
      buildPhases({ deploymentId }).length >= 3 &&
      buildTimeline({ deploymentId }).length >= 4 &&
      buildResponsibilities({ deploymentId }).length >= 3,
  };
}

export function runImplementationPlanRuntime(input?: {
  deploymentId?: string;
}): ProposalRuntimeResult<ImplementationPlanRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "impl-default";
  const stages: ProposalStageResult[] = [];

  const milestones = runStage("impl-milestones", "Milestones", () => buildMilestones({ deploymentId }), stages);
  const phases = runStage("impl-phases", "Phases", () => buildPhases({ deploymentId }), stages);
  const timeline = runStage("impl-timeline", "Timeline", () => buildTimeline({ deploymentId }), stages);
  const responsibilities = runStage("impl-responsibilities", "Responsibilities", () => buildResponsibilities({ deploymentId }), stages);

  const validation = runStage("impl-validate", "Implementation Plan Validation", () => validateImplementationPlanRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Implementation plan validation failed");

  const payload: ImplementationPlanRuntimePayload = {
    version: IMPLEMENTATION_PLAN_RUNTIME_VERSION,
    proposalVersion: PROPOSAL_GENERATION_VERSION,
    milestones,
    phases,
    timeline,
    responsibilities,
    summary: `implementation-plan milestones=${milestones.length} phases=${phases.length} timeline=${timeline.length}`,
  };

  return finalizeRuntime({ domain: "implementation-plan", deploymentId, stages, payload, summary: payload.summary });
}
