export const AI_INTEGRATION_VERSION = "v13.0-ai-integration-1" as const;

export type AiIntegrationStatus = "success" | "failed";

export type AiIntegrationStageStatus = "completed" | "failed";

export type AiIntegrationMode = "stub" | "real";

export interface AiIntegrationStageResult {
  stageId: string;
  label: string;
  status: AiIntegrationStageStatus;
  durationMs: number;
  message: string;
}

export interface AiIntegrationRuntimeResult<TPayload> {
  version: typeof AI_INTEGRATION_VERSION;
  runtimeId: string;
  domain: string;
  status: AiIntegrationStatus;
  stages: AiIntegrationStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface AiIntegrationEvidence {
  evidenceId: string;
  version: typeof AI_INTEGRATION_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: AiIntegrationStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}

export interface TokenUsageRecord {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface AiGenerationRequest {
  deploymentId: string;
  providerId?: string;
  modelId?: string;
  prompt: string;
  systemPrompt?: string;
  outputType?: "text" | "structured";
  task?: string;
  forceMode?: AiIntegrationMode;
}

export interface AiGenerationResponse {
  responseId: string;
  providerId: string;
  modelId: string;
  content: string;
  structured?: Record<string, unknown>;
  tokenUsage: TokenUsageRecord;
  mode: AiIntegrationMode;
  usedFallback: boolean;
  latencyMs: number;
  success: boolean;
  error?: string;
}
