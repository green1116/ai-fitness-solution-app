import {
  QUOTE_EXECUTION_STATUS_CREATED,
  QUOTE_EXECUTION_STATUS_FAILED,
} from "../shared/integration-constants";
import type {
  QuoteExecutionContext,
  QuoteExecutionResult,
  QuoteRuntimeIntegrationService,
} from "../shared/integration-types";

function buildQuoteId(workspaceId: string): string {
  return `quote-${workspaceId.trim()}`;
}

export function createQuoteExecution(context: QuoteExecutionContext): QuoteExecutionResult {
  const logs: string[] = [];
  const { workspaceId, snapshot, ports } = context;

  if (workspaceId.trim().length === 0) {
    return {
      success: false,
      status: QUOTE_EXECUTION_STATUS_FAILED,
      logs: ["workspaceId is required"],
    };
  }

  if (snapshot.workspaceId !== workspaceId) {
    return {
      success: false,
      status: QUOTE_EXECUTION_STATUS_FAILED,
      logs: ["snapshot workspaceId mismatch"],
    };
  }

  const exists = ports.persistence.exists(workspaceId);
  logs.push(`persistence.exists=${exists}`);

  const readiness = ports.api.getQuoteReadiness(workspaceId);
  logs.push(`api.readiness=${readiness}`);

  const eligibility = ports.commercial.getQuoteEligibility(workspaceId);
  logs.push(`commercial.eligibility=${eligibility}`);

  if (eligibility === "INELIGIBLE") {
    return {
      success: false,
      status: QUOTE_EXECUTION_STATUS_FAILED,
      logs: [...logs, "quote commercial eligibility blocked execution"],
    };
  }

  const loadedSnapshot = ports.persistence.loadQuoteSnapshot(workspaceId);
  logs.push(`persistence.runtimeState=${loadedSnapshot.runtimeState}`);

  if (loadedSnapshot.runtimeState !== snapshot.runtimeState) {
    return {
      success: false,
      status: QUOTE_EXECUTION_STATUS_FAILED,
      logs: [...logs, "persistence snapshot runtimeState mismatch"],
    };
  }

  const quoteId = buildQuoteId(workspaceId);
  logs.push(`execution.created=${quoteId}`);

  return {
    success: true,
    quoteId,
    status: QUOTE_EXECUTION_STATUS_CREATED,
    logs,
  };
}

export function createQuoteRuntimeIntegrationService(): QuoteRuntimeIntegrationService {
  return {
    createQuoteExecution(context: QuoteExecutionContext): QuoteExecutionResult {
      return createQuoteExecution(context);
    },
    describe(context: QuoteExecutionContext): string {
      return [
        `workspaceId=${context.workspaceId}`,
        `runtimeState=${context.snapshot.runtimeState}`,
        `quoteReadiness=${context.snapshot.quoteReadiness}`,
      ].join(" ");
    },
  };
}
