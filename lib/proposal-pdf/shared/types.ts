export const PROPOSAL_PDF_VERSION = "v11.2-proposal-pdf-1" as const;

export type ProposalPdfRuntimeStatus = "success" | "failed";

export type ProposalPdfStageStatus = "completed" | "failed";

export interface ProposalPdfStageResult {
  stageId: string;
  label: string;
  status: ProposalPdfStageStatus;
  durationMs: number;
  message: string;
}

export interface ProposalPdfRuntimeResult<TPayload> {
  version: typeof PROPOSAL_PDF_VERSION;
  runtimeId: string;
  domain: string;
  status: ProposalPdfRuntimeStatus;
  stages: ProposalPdfStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface ProposalPdfEvidence {
  evidenceId: string;
  version: typeof PROPOSAL_PDF_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: ProposalPdfRuntimeStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
