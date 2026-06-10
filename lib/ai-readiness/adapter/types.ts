import type { AI_READINESS_VERSION, ReadinessStubMode } from "../shared/types";
import type { CompletionResponse } from "../completion/types";
import type { TokenUsage } from "../token/types";

export const AI_ADAPTER_RUNTIME_VERSION = "v11.5-ai-adapter-runtime-1" as const;

export interface AdapterGenerateInput {
  deploymentId: string;
  projectName: string;
  context?: string;
}

export interface AdapterGenerateResult {
  resultId: string;
  task: "proposal" | "summary" | "risk-analysis" | "compliance-matrix";
  completion: CompletionResponse;
  tokenUsage: TokenUsage;
  mode: ReadinessStubMode;
}

export interface AiAdapter {
  adapterId: string;
  providerId: string;
  modelId: string;
  generateProposal(input: AdapterGenerateInput): AdapterGenerateResult;
  generateSummary(input: AdapterGenerateInput): AdapterGenerateResult;
  generateRiskAnalysis(input: AdapterGenerateInput): AdapterGenerateResult;
  generateComplianceMatrix(input: AdapterGenerateInput): AdapterGenerateResult;
}

export interface AiAdapterRuntimePayload {
  version: typeof AI_ADAPTER_RUNTIME_VERSION;
  readinessVersion: typeof AI_READINESS_VERSION;
  adapter: AiAdapter;
  results: AdapterGenerateResult[];
  summary: string;
}
