import type { QuoteApiAdapterPort } from "../ports/quote-api.adapter.port";
import type { QuotePersistenceAdapterPort } from "../ports/quote-persistence.adapter.port";
import type { QuoteRuntimePorts } from "../shared/integration-types";
import {
  QUOTE_EXECUTION_STATUS_CREATED,
  QUOTE_EXECUTION_STATUS_FAILED,
} from "../shared/integration-constants";
import type { QuoteExecutionResult } from "../shared/integration-types";
import { resolveQuoteFromEntry } from "../bridge/quote-runtime-bridge";
import {
  createQuoteAuditTrail,
  QUOTE_AUDIT_CREATED,
  QUOTE_AUDIT_EXPOSED,
  QUOTE_AUDIT_FAILED,
  QUOTE_AUDIT_PERSISTED,
  type QuoteAuditTrailEntry,
} from "../reliability/quote-audit-trail";
import {
  createQuoteError,
  describeQuoteError,
  QUOTE_ERROR_API_EXPOSURE,
  QUOTE_ERROR_PERSISTENCE,
  QUOTE_ERROR_VALIDATION,
  QUOTE_ERROR_WORKFLOW,
  type QuoteError,
} from "../reliability/quote-error";
import {
  createExecutionId,
  createQuoteExecutionLogCollector,
  type QuoteExecutionLog,
} from "../reliability/quote-execution-log";
import {
  createQuoteRetryPolicy,
  DEFAULT_QUOTE_RETRY_POLICY,
  describeQuoteRetryPolicy,
  executeWithQuoteRetryPolicy,
  type QuoteRetryPolicy,
} from "../reliability/quote-retry-policy";
import {
  createQuoteWorkflowContext,
  type QuoteWorkflowContext,
} from "./quote-workflow-context";
import {
  QUOTE_WORKFLOW_STATE_CREATED,
  QUOTE_WORKFLOW_STATE_EXPOSED,
  QUOTE_WORKFLOW_STATE_FAILED,
  QUOTE_WORKFLOW_STATE_PERSISTED,
  type QuoteWorkflowState,
} from "./quote-workflow-state";

export interface QuoteWorkflowOrchestrationResult extends QuoteExecutionResult {
  workflowState: QuoteWorkflowState;
  executionId: string;
  executionLogs: QuoteExecutionLog[];
  auditTrail: QuoteAuditTrailEntry[];
  retryPolicy: QuoteRetryPolicy;
  error?: QuoteError;
}

export interface QuoteWorkflowOrchestrator {
  execute(context: QuoteWorkflowContext): QuoteWorkflowOrchestrationResult;
  executeFromWorkspace(workspaceId: string): QuoteWorkflowOrchestrationResult;
}

function buildQuoteId(workspaceId: string): string {
  return `quote-${workspaceId.trim()}`;
}

function resolvePersistenceAdapterPort(
  persistence: QuoteRuntimePorts["persistence"],
): QuotePersistenceAdapterPort | null {
  if (typeof (persistence as QuotePersistenceAdapterPort).persistQuoteState === "function") {
    return persistence as QuotePersistenceAdapterPort;
  }
  return null;
}

function resolveApiAdapterPort(api: QuoteRuntimePorts["api"]): QuoteApiAdapterPort | null {
  if (typeof (api as QuoteApiAdapterPort).exposeQuoteApi === "function") {
    return api as QuoteApiAdapterPort;
  }
  return null;
}

function buildFailedResult(input: {
  executionId: string;
  quoteId?: string;
  workflowState: QuoteWorkflowState;
  error: QuoteError;
  logs: string[];
  executionLogs: QuoteExecutionLog[];
  auditTrail: QuoteAuditTrailEntry[];
  retryPolicy: QuoteRetryPolicy;
}): QuoteWorkflowOrchestrationResult {
  return {
    success: false,
    quoteId: input.quoteId,
    status: QUOTE_EXECUTION_STATUS_FAILED,
    workflowState: input.workflowState,
    executionId: input.executionId,
    executionLogs: input.executionLogs,
    auditTrail: input.auditTrail,
    retryPolicy: input.retryPolicy,
    error: input.error,
    logs: [...input.logs, describeQuoteRetryPolicy(input.retryPolicy), describeQuoteError(input.error)],
  };
}

export function executeQuoteWorkflow(
  context: QuoteWorkflowContext,
  options?: { retryPolicy?: QuoteRetryPolicy },
): QuoteWorkflowOrchestrationResult {
  const retryPolicy = options?.retryPolicy ?? createQuoteRetryPolicy(DEFAULT_QUOTE_RETRY_POLICY);
  const { execution, ports } = context;
  const { workspaceId } = execution;
  const executionId = createExecutionId(workspaceId);
  const executionLogCollector = createQuoteExecutionLogCollector(executionId, workspaceId);
  const auditTrailCollector = createQuoteAuditTrail();
  const logs: string[] = [];

  const recordLog = (state: string, message: string) => {
    executionLogCollector.append({ executionId, workspaceId, state, message });
    logs.push(message);
  };

  if (workspaceId.trim().length === 0) {
    const error = createQuoteError({
      type: QUOTE_ERROR_VALIDATION,
      message: "workspaceId is required",
    });
    recordLog(QUOTE_WORKFLOW_STATE_FAILED, error.message);
    auditTrailCollector.record({
      executionId,
      workspaceId: workspaceId || "unknown",
      event: QUOTE_AUDIT_FAILED,
      detail: error.message,
    });
    return buildFailedResult({
      executionId,
      workflowState: QUOTE_WORKFLOW_STATE_FAILED,
      error,
      logs,
      executionLogs: executionLogCollector.entries,
      auditTrail: auditTrailCollector.entries,
      retryPolicy,
    });
  }

  const bridgeSnapshot = resolveQuoteFromEntry(workspaceId);
  const snapshot = bridgeSnapshot.snapshot;
  recordLog(QUOTE_WORKFLOW_STATE_CREATED, `snapshot.runtimeState=${snapshot.runtimeState}`);
  recordLog(QUOTE_WORKFLOW_STATE_CREATED, `snapshot.quoteReadiness=${snapshot.quoteReadiness}`);
  auditTrailCollector.record({
    executionId,
    workspaceId,
    event: QUOTE_AUDIT_CREATED,
    detail: `runtimeState=${snapshot.runtimeState}`,
  });

  let workflowState: QuoteWorkflowState = QUOTE_WORKFLOW_STATE_CREATED;
  const quoteId = buildQuoteId(workspaceId);

  const persistencePort = resolvePersistenceAdapterPort(ports.persistence);
  if (!persistencePort) {
    const error = createQuoteError({
      type: QUOTE_ERROR_WORKFLOW,
      message: "persistence adapter port unavailable",
    });
    recordLog(QUOTE_WORKFLOW_STATE_FAILED, error.message);
    auditTrailCollector.record({
      executionId,
      workspaceId,
      event: QUOTE_AUDIT_FAILED,
      detail: error.message,
    });
    return buildFailedResult({
      executionId,
      workflowState: QUOTE_WORKFLOW_STATE_FAILED,
      error,
      logs,
      executionLogs: executionLogCollector.entries,
      auditTrail: auditTrailCollector.entries,
      retryPolicy,
    });
  }

  const persistenceRetry = executeWithQuoteRetryPolicy({
    policy: retryPolicy,
    operation: () => persistencePort.persistQuoteState(workspaceId, quoteId),
    isSuccess: (result) => result === true,
    onAttempt: (record) => {
      recordLog(
        QUOTE_WORKFLOW_STATE_PERSISTED,
        `persistence.retry attempt=${record.attempt} delayMs=${record.delayMs} succeeded=${record.succeeded}`,
      );
    },
  });

  const persisted = persistenceRetry.result;
  recordLog(QUOTE_WORKFLOW_STATE_PERSISTED, `persistence.persistQuoteState=${persisted}`);
  if (!persisted) {
    const error = createQuoteError({
      type: QUOTE_ERROR_PERSISTENCE,
      message: "persistQuoteState failed",
    });
    auditTrailCollector.record({
      executionId,
      workspaceId,
      event: QUOTE_AUDIT_FAILED,
      detail: error.message,
    });
    return buildFailedResult({
      executionId,
      quoteId,
      workflowState: QUOTE_WORKFLOW_STATE_FAILED,
      error,
      logs,
      executionLogs: executionLogCollector.entries,
      auditTrail: auditTrailCollector.entries,
      retryPolicy,
    });
  }

  workflowState = QUOTE_WORKFLOW_STATE_PERSISTED;
  auditTrailCollector.record({
    executionId,
    workspaceId,
    event: QUOTE_AUDIT_PERSISTED,
    detail: `quoteId=${quoteId} attempts=${persistenceRetry.attempts}`,
  });

  const apiPort = resolveApiAdapterPort(ports.api);
  if (!apiPort) {
    const error = createQuoteError({
      type: QUOTE_ERROR_WORKFLOW,
      message: "api adapter port unavailable",
    });
    recordLog(QUOTE_WORKFLOW_STATE_FAILED, error.message);
    auditTrailCollector.record({
      executionId,
      workspaceId,
      event: QUOTE_AUDIT_FAILED,
      detail: error.message,
    });
    return buildFailedResult({
      executionId,
      quoteId,
      workflowState: QUOTE_WORKFLOW_STATE_FAILED,
      error,
      logs,
      executionLogs: executionLogCollector.entries,
      auditTrail: auditTrailCollector.entries,
      retryPolicy,
    });
  }

  const apiRetry = executeWithQuoteRetryPolicy({
    policy: retryPolicy,
    operation: () => apiPort.exposeQuoteApi(workspaceId),
    isSuccess: (result) => result.exposed === true,
    onAttempt: (record) => {
      recordLog(
        QUOTE_WORKFLOW_STATE_EXPOSED,
        `api.retry attempt=${record.attempt} delayMs=${record.delayMs} succeeded=${record.succeeded}`,
      );
    },
  });

  const exposure = apiRetry.result;
  recordLog(QUOTE_WORKFLOW_STATE_EXPOSED, `api.exposeQuoteApi=${exposure.exposed}`);
  recordLog(QUOTE_WORKFLOW_STATE_EXPOSED, `api.route=${exposure.route}`);
  if (!exposure.exposed) {
    const error = createQuoteError({
      type: QUOTE_ERROR_API_EXPOSURE,
      message: "exposeQuoteApi failed",
    });
    auditTrailCollector.record({
      executionId,
      workspaceId,
      event: QUOTE_AUDIT_FAILED,
      detail: error.message,
    });
    return buildFailedResult({
      executionId,
      quoteId,
      workflowState: QUOTE_WORKFLOW_STATE_FAILED,
      error,
      logs,
      executionLogs: executionLogCollector.entries,
      auditTrail: auditTrailCollector.entries,
      retryPolicy,
    });
  }

  workflowState = QUOTE_WORKFLOW_STATE_EXPOSED;
  auditTrailCollector.record({
    executionId,
    workspaceId,
    event: QUOTE_AUDIT_EXPOSED,
    detail: `route=${exposure.route} attempts=${apiRetry.attempts}`,
  });

  const readiness = ports.api.getQuoteReadiness(workspaceId);
  recordLog(QUOTE_WORKFLOW_STATE_EXPOSED, `api.readiness=${readiness}`);
  logs.push(describeQuoteRetryPolicy(retryPolicy));

  return {
    success: true,
    quoteId,
    status: QUOTE_EXECUTION_STATUS_CREATED,
    workflowState,
    executionId,
    executionLogs: executionLogCollector.entries,
    auditTrail: auditTrailCollector.entries,
    retryPolicy,
    logs: [...logs, ...executionLogCollector.toMessages(), ...auditTrailCollector.toMessages()],
  };
}

export function createQuoteWorkflowOrchestrator(ports: QuoteRuntimePorts): QuoteWorkflowOrchestrator {
  return {
    execute(context: QuoteWorkflowContext): QuoteWorkflowOrchestrationResult {
      return executeQuoteWorkflow({
        execution: context.execution,
        ports,
      });
    },
    executeFromWorkspace(workspaceId: string): QuoteWorkflowOrchestrationResult {
      return executeQuoteWorkflow(createQuoteWorkflowContext({ workspaceId, ports }));
    },
  };
}

export function describeQuoteWorkflowOrchestrator(workspaceId: string): string {
  const bridgeSnapshot = resolveQuoteFromEntry(workspaceId);
  return [
    `workspaceId=${workspaceId}`,
    `runtimeState=${bridgeSnapshot.snapshot.runtimeState}`,
    `dependencyTag=${bridgeSnapshot.dependencyTag}`,
  ].join(" ");
}
