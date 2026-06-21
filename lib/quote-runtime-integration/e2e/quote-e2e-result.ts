import type { QuoteAuditTrailEntry } from "../reliability/quote-audit-trail";
import type { QuoteExecutionResult } from "../shared/integration-types";
import type { QuoteWorkflowOrchestrationResult } from "../workflow/quote-workflow-orchestrator";

export interface QuoteE2ePersistenceResult {
  persisted: boolean;
  quoteId?: string;
  exists: boolean;
  runtimeState: string;
}

export interface QuoteE2eApiResult {
  exposed: boolean;
  route: string;
  readiness: string;
}

export interface QuoteEndToEndResult {
  executionResult: QuoteExecutionResult;
  workflowResult: QuoteWorkflowOrchestrationResult;
  persistenceResult: QuoteE2ePersistenceResult;
  apiResult: QuoteE2eApiResult;
  logs: string[];
  auditTrail: QuoteAuditTrailEntry[];
}

export function isQuoteEndToEndSuccess(result: QuoteEndToEndResult): boolean {
  return (
    result.executionResult.success &&
    result.workflowResult.success &&
    result.persistenceResult.persisted &&
    result.apiResult.exposed
  );
}

export function describeQuoteEndToEndResult(result: QuoteEndToEndResult): string {
  return [
    `execution.success=${result.executionResult.success}`,
    `workflow.success=${result.workflowResult.success}`,
    `persistence.persisted=${result.persistenceResult.persisted}`,
    `api.exposed=${result.apiResult.exposed}`,
    `auditTrail.count=${result.auditTrail.length}`,
  ].join(" ");
}
