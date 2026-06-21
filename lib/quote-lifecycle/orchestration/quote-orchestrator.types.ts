/**
 * V58 P7 — Quote Runtime Orchestrator Types
 */

export const QUOTE_ORCHESTRATOR_VERSION = "v58-p7-quote-orchestrator-1" as const;
export type QuoteOrchestratorVersion = typeof QUOTE_ORCHESTRATOR_VERSION;

export interface QuoteOrchestrationContext {
  quoteId: string;
  workspaceId: string;
  jobId?: string;
  executionId?: string;
}

export interface QuoteOrchestrationInput {
  context: QuoteOrchestrationContext;
  action: string;
  payload?: unknown;
  observedAt?: string;
}

export type QuoteOrchestrationFlowStep =
  | "lifecycle"
  | "job"
  | "async"
  | "event"
  | "status"
  | "history";

export const QUOTE_ORCHESTRATION_FLOW_ORDER: readonly QuoteOrchestrationFlowStep[] = [
  "lifecycle",
  "job",
  "async",
  "event",
  "status",
  "history",
] as const;

export interface QuoteLifecycleCoordinationResult {
  status: string;
  stepIndex: number;
  lifecycleEventType: string;
}

export interface QuoteJobCoordinationResult {
  jobId: string;
  status: string;
  jobEventType: string;
}

export interface QuoteAsyncCoordinationResult {
  asyncHandle: string;
  status: string;
  clientEventType: string;
}

export interface QuoteEventCoordinationResult {
  eventId: string;
  eventType: string;
  payload: unknown;
}

export interface QuoteStatusCoordinationResult {
  syncedStatus: string;
  syncEventType: string;
}

export interface QuoteHistoryCoordinationResult {
  recordCount: number;
  lastEventId: string;
}

export interface QuoteOrchestrationStepResult {
  step: QuoteOrchestrationFlowStep;
  success: boolean;
  status: string;
  eventId?: string;
  metadata: Record<string, unknown>;
}

export interface QuoteOrchestrationResult {
  orchestrationId: string;
  version: QuoteOrchestratorVersion;
  context: QuoteOrchestrationContext;
  steps: QuoteOrchestrationStepResult[];
  aggregatedStatus: string;
  deterministic: boolean;
  completedAt: string;
  historyRecordCount: number;
}

export interface QuoteOrchestrationFlowResolution {
  steps: readonly QuoteOrchestrationFlowStep[];
  entryPoint: "orchestrator";
  bypassAllowed: false;
}
