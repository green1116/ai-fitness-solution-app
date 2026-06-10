export const AI_READINESS_VERSION = "v11.5-ai-readiness-1" as const;

export type AiReadinessStatus = "success" | "failed";

export type AiReadinessStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface AiReadinessStageResult {
  stageId: string;
  label: string;
  status: AiReadinessStageStatus;
  durationMs: number;
  message: string;
}

export interface AiReadinessRuntimeResult<TPayload> {
  version: typeof AI_READINESS_VERSION;
  runtimeId: string;
  domain: string;
  status: AiReadinessStatus;
  stages: AiReadinessStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface AiReadinessEvidence {
  evidenceId: string;
  version: typeof AI_READINESS_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: AiReadinessStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
