import type { AI_READINESS_VERSION } from "../shared/types";
import type { AiProviderId } from "../provider/types";

export const MODEL_RUNTIME_VERSION = "v11.5-model-runtime-1" as const;

export type ModelFamily = "gpt" | "claude" | "gemini" | "deepseek" | "qwen";

export type ModelCapability =
  | "chat"
  | "completion"
  | "json-mode"
  | "long-context"
  | "vision";

export interface ModelDefinition {
  modelId: string;
  providerId: AiProviderId;
  family: ModelFamily;
  displayName: string;
  contextWindow: number;
  capabilities: ModelCapability[];
}

export interface ModelRuntimePayload {
  version: typeof MODEL_RUNTIME_VERSION;
  readinessVersion: typeof AI_READINESS_VERSION;
  models: ModelDefinition[];
  summary: string;
}
