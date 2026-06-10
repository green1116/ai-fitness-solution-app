import type { AI_READINESS_VERSION, ReadinessStubMode } from "../shared/types";

export const COMPLETION_RUNTIME_VERSION = "v11.5-completion-runtime-1" as const;

export type FinishReason = "stop" | "length" | "content_filter" | "tool_calls";

export interface CompletionRequest {
  requestId: string;
  modelId: string;
  promptKind: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  mode: ReadinessStubMode;
}

export interface CompletionResponse {
  responseId: string;
  requestId: string;
  content: string;
  finishReason: FinishReason;
  mode: ReadinessStubMode;
}

export interface CompletionRuntimePayload {
  version: typeof COMPLETION_RUNTIME_VERSION;
  readinessVersion: typeof AI_READINESS_VERSION;
  request: CompletionRequest;
  response: CompletionResponse;
  summary: string;
}
