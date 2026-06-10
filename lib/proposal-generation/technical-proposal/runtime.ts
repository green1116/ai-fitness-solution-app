import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalRuntimeResult, ProposalStageResult } from "../shared/types";
import { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import {
  buildDeploymentStrategy,
  buildEquipmentStrategy,
  buildSolutionArchitecture,
  buildTechnicalScope,
} from "./builders";
import type { TechnicalProposalRuntimePayload } from "./types";
import { TECHNICAL_PROPOSAL_RUNTIME_VERSION } from "./types";

export function validateTechnicalProposalRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "technical-default";
  return {
    valid:
      buildTechnicalScope({ deploymentId }).length >= 3 &&
      buildSolutionArchitecture({ deploymentId }).length >= 3 &&
      buildEquipmentStrategy({ deploymentId }).length >= 2 &&
      buildDeploymentStrategy({ deploymentId }).length >= 3,
  };
}

export function runTechnicalProposalRuntime(input?: {
  deploymentId?: string;
}): ProposalRuntimeResult<TechnicalProposalRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "technical-default";
  const stages: ProposalStageResult[] = [];

  const technicalScope = runStage("tech-scope", "Technical Scope", () => buildTechnicalScope({ deploymentId }), stages);
  const solutionArchitecture = runStage("tech-arch", "Solution Architecture", () => buildSolutionArchitecture({ deploymentId }), stages);
  const equipmentStrategy = runStage("tech-equipment", "Equipment Strategy", () => buildEquipmentStrategy({ deploymentId }), stages);
  const deploymentStrategy = runStage("tech-deploy", "Deployment Strategy", () => buildDeploymentStrategy({ deploymentId }), stages);

  const validation = runStage("tech-validate", "Technical Proposal Validation", () => validateTechnicalProposalRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Technical proposal validation failed");

  const payload: TechnicalProposalRuntimePayload = {
    version: TECHNICAL_PROPOSAL_RUNTIME_VERSION,
    proposalVersion: PROPOSAL_GENERATION_VERSION,
    technicalScope,
    solutionArchitecture,
    equipmentStrategy,
    deploymentStrategy,
    summary: `technical-proposal scope=${technicalScope.length} arch=${solutionArchitecture.length} equipment=${equipmentStrategy.length}`,
  };

  return finalizeRuntime({ domain: "technical-proposal", deploymentId, stages, payload, summary: payload.summary });
}
