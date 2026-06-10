import type { AI_INTEGRATION_VERSION } from "../shared/types";

export const PROMPT_ORCHESTRATION_RUNTIME_VERSION = "v13.0-prompt-orchestration-1" as const;

export const PROMPT_KINDS = [
  "system",
  "user",
  "tender",
  "proposal",
  "knowledge",
] as const;

export type PromptKind = (typeof PROMPT_KINDS)[number];

export interface PromptTemplate {
  templateId: string;
  kind: PromptKind;
  version: string;
  title: string;
  content: string;
  variables: string[];
}

export interface PromptAuditEntry {
  auditId: string;
  templateId: string;
  version: string;
  kind: PromptKind;
  deployedAt: string;
  checksum: string;
}

export interface PromptTrace {
  traceId: string;
  deploymentId: string;
  templates: Array<{ kind: PromptKind; templateId: string; version: string }>;
  assembledPrompt: string;
  tracedAt: string;
}

export interface PromptOrchestrationRuntimePayload {
  version: typeof PROMPT_ORCHESTRATION_RUNTIME_VERSION;
  integrationVersion: typeof AI_INTEGRATION_VERSION;
  templates: PromptTemplate[];
  audit: PromptAuditEntry[];
  trace: PromptTrace;
  summary: string;
}
