export const PROPOSAL_GENERATION_VERSION = "v11.0-proposal-generation-1" as const;

export type ProposalRuntimeStatus = "success" | "failed";

export type ProposalStageStatus = "completed" | "failed";

export interface ProposalStageResult {
  stageId: string;
  label: string;
  status: ProposalStageStatus;
  durationMs: number;
  message: string;
}

export interface ProposalRuntimeResult<TPayload> {
  version: typeof PROPOSAL_GENERATION_VERSION;
  runtimeId: string;
  domain: string;
  status: ProposalRuntimeStatus;
  stages: ProposalStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface ProposalGenerationEvidence {
  evidenceId: string;
  version: typeof PROPOSAL_GENERATION_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: ProposalRuntimeStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
