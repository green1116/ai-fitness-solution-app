import type { PROPOSAL_GENERATION_VERSION } from "../shared/types";

export const TECHNICAL_PROPOSAL_RUNTIME_VERSION = "v11.0-technical-proposal-runtime-1" as const;

export interface TechnicalScope { scopeId: string; area: string; description: string; coverage: string; }
export interface SolutionArchitecture { archId: string; layer: string; components: string[]; description: string; }
export interface EquipmentStrategy { strategyId: string; zone: string; equipment: string[]; rationale: string; }
export interface DeploymentStrategy { deployId: string; phase: string; approach: string; duration: string; }

export interface TechnicalProposalRuntimePayload {
  version: typeof TECHNICAL_PROPOSAL_RUNTIME_VERSION;
  proposalVersion: typeof PROPOSAL_GENERATION_VERSION;
  technicalScope: TechnicalScope[];
  solutionArchitecture: SolutionArchitecture[];
  equipmentStrategy: EquipmentStrategy[];
  deploymentStrategy: DeploymentStrategy[];
  summary: string;
}
