import type { AI_INTEGRATION_VERSION, AiGenerationRequest, AiGenerationResponse } from "../shared/types";

export const AI_PROVIDER_ADAPTER_RUNTIME_VERSION = "v13.0-ai-provider-adapter-1" as const;

export const AI_PROVIDER_IDS = [
  "openai",
  "claude",
  "gemini",
  "deepseek",
  "qwen",
] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export interface AiProviderAdapter {
  adapterId: string;
  providerId: AiProviderId;
  modelId: string;
  generateText(input: AiGenerationRequest): AiGenerationResponse;
  generateStructuredOutput(input: AiGenerationRequest): AiGenerationResponse;
  generateProposalDraft(input: AiGenerationRequest): AiGenerationResponse;
  generateComplianceDraft(input: AiGenerationRequest): AiGenerationResponse;
  generateRiskDraft(input: AiGenerationRequest): AiGenerationResponse;
}

export interface AiProviderAdapterRuntimePayload {
  version: typeof AI_PROVIDER_ADAPTER_RUNTIME_VERSION;
  integrationVersion: typeof AI_INTEGRATION_VERSION;
  supportedProviders: AiProviderId[];
  adapterResults: AiGenerationResponse[];
  mode: "stub" | "real";
  summary: string;
}
