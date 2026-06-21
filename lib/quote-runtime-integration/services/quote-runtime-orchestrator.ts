import type { QuotePortRegistry } from "@/lib/quote-runtime/ports/quote-port-types";
import { resolveQuoteFromEntry } from "../bridge/quote-runtime-bridge";
import { createQuoteExecution } from "./quote-execution.service";
import type {
  QuoteExecutionContext,
  QuoteExecutionResult,
  QuoteRuntimeExecutor,
} from "../shared/integration-types";

export function createQuoteRuntimeOrchestrator(ports: QuotePortRegistry): QuoteRuntimeExecutor {
  return {
    execute(context: QuoteExecutionContext): QuoteExecutionResult {
      return createQuoteExecution({
        workspaceId: context.workspaceId,
        snapshot: context.snapshot,
        ports,
      });
    },
  };
}

export function executeQuoteRuntimeFlow(
  workspaceId: string,
  ports: QuotePortRegistry,
): QuoteExecutionResult {
  const bridgeSnapshot = resolveQuoteFromEntry(workspaceId);
  const orchestrator = createQuoteRuntimeOrchestrator(ports);
  return orchestrator.execute({
    workspaceId,
    snapshot: bridgeSnapshot.snapshot,
    ports,
  });
}

export function describeQuoteRuntimeOrchestrator(workspaceId: string): string {
  const bridgeSnapshot = resolveQuoteFromEntry(workspaceId);
  return [
    `workspaceId=${workspaceId}`,
    `runtimeState=${bridgeSnapshot.snapshot.runtimeState}`,
    `dependencyTag=${bridgeSnapshot.dependencyTag}`,
  ].join(" ");
}
