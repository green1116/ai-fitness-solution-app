import type { AI_READINESS_VERSION, ReadinessStubMode } from "../shared/types";

export const AI_PROVIDER_RUNTIME_VERSION = "v11.5-ai-provider-runtime-1" as const;

export type AiProviderId = "openai" | "claude" | "gemini" | "deepseek" | "qwen";

export interface AiProviderDefinition {
  providerId: AiProviderId;
  displayName: string;
  apiBaseUrl: string;
  readinessLevel: "stub" | "contract-ready";
  supportedModes: ReadinessStubMode[];
  description: string;
}

export interface AiProviderRuntimePayload {
  version: typeof AI_PROVIDER_RUNTIME_VERSION;
  readinessVersion: typeof AI_READINESS_VERSION;
  providers: AiProviderDefinition[];
  supportedProviders: AiProviderId[];
  summary: string;
}
