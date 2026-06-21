import type { QuoteExecutionContext, QuoteRuntimePorts } from "../shared/integration-types";
import { resolveQuoteFromEntry } from "../bridge/quote-runtime-bridge";

export interface QuoteWorkflowContext {
  execution: QuoteExecutionContext;
  ports: QuoteRuntimePorts;
}

export function createQuoteWorkflowContext(input: {
  workspaceId: string;
  ports: QuoteRuntimePorts;
}): QuoteWorkflowContext {
  const bridgeSnapshot = resolveQuoteFromEntry(input.workspaceId);
  return {
    execution: {
      workspaceId: input.workspaceId,
      snapshot: bridgeSnapshot.snapshot,
      ports: input.ports,
    },
    ports: input.ports,
  };
}

export function resolveQuoteWorkflowSnapshot(context: QuoteWorkflowContext) {
  return resolveQuoteFromEntry(context.execution.workspaceId);
}

export function describeQuoteWorkflowContext(context: QuoteWorkflowContext): string {
  return [
    `workspaceId=${context.execution.workspaceId}`,
    `runtimeState=${context.execution.snapshot.runtimeState}`,
    `quoteReadiness=${context.execution.snapshot.quoteReadiness}`,
  ].join(" ");
}
