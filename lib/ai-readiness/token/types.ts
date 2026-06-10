import type { AI_READINESS_VERSION } from "../shared/types";

export const TOKEN_RUNTIME_VERSION = "v11.5-token-runtime-1" as const;

export interface TokenUsage {
  usageId: string;
  requestId: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  mode: "readiness-stub";
}

export interface TokenRuntimePayload {
  version: typeof TOKEN_RUNTIME_VERSION;
  readinessVersion: typeof AI_READINESS_VERSION;
  usage: TokenUsage;
  samples: TokenUsage[];
  summary: string;
}
