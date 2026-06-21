import type { QuoteExecutionResult, QuoteRuntimeExecutor } from "../shared/integration-types";
import { createQuoteExecution } from "./quote-execution.service";
import type { QuotePortBindingContext } from "../ports/quote-port-binding";
import type { QuoteRuntimePortRegistry } from "../ports/quote-port-registry";

export function executeWithPortBinding(binding: QuotePortBindingContext): QuoteExecutionResult {
  return createQuoteExecution({
    workspaceId: binding.execution.workspaceId,
    snapshot: binding.execution.snapshot,
    ports: binding.ports,
  });
}

export function createQuotePortExecutor(portRegistry: QuoteRuntimePortRegistry): QuoteRuntimeExecutor {
  return {
    execute(context) {
      const binding = portRegistry.bind(context);
      return executeWithPortBinding(binding);
    },
  };
}

export function mapExecutionThroughPortBinding(
  portRegistry: QuoteRuntimePortRegistry,
  binding: QuotePortBindingContext,
): QuoteExecutionResult {
  const rebound = portRegistry.bind(binding.execution);
  return executeWithPortBinding(rebound);
}
