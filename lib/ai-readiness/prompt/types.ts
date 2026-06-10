import type { AI_READINESS_VERSION } from "../shared/types";

export const PROMPT_RUNTIME_VERSION = "v11.5-prompt-runtime-1" as const;

export type PromptKind = "system" | "user" | "proposal" | "tender";

export interface PromptTemplate {
  templateId: string;
  kind: PromptKind;
  name: string;
  description: string;
  content: string;
  variables: string[];
}

export interface PromptRuntimePayload {
  version: typeof PROMPT_RUNTIME_VERSION;
  readinessVersion: typeof AI_READINESS_VERSION;
  templates: PromptTemplate[];
  summary: string;
}

export const PROMPT_KINDS: PromptKind[] = ["system", "user", "proposal", "tender"];
