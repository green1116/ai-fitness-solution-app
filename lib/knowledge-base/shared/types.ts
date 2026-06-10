export const KNOWLEDGE_BASE_VERSION = "v12.5-knowledge-base-1" as const;

export type KnowledgeBaseStatus = "success" | "failed";

export type KnowledgeBaseStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface KnowledgeBaseStageResult {
  stageId: string;
  label: string;
  status: KnowledgeBaseStageStatus;
  durationMs: number;
  message: string;
}

export interface KnowledgeBaseRuntimeResult<TPayload> {
  version: typeof KNOWLEDGE_BASE_VERSION;
  runtimeId: string;
  domain: string;
  status: KnowledgeBaseStatus;
  stages: KnowledgeBaseStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface KnowledgeBaseEvidence {
  evidenceId: string;
  version: typeof KNOWLEDGE_BASE_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: KnowledgeBaseStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
