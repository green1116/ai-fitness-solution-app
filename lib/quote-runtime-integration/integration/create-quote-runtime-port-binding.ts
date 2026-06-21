import type { QuotePortRegistry } from "@/lib/quote-runtime/ports/quote-port-types";
import { loadV55QuoteRuntimeSnapshot } from "../bridge/quote-runtime-bridge";
import type { QuoteExecutionContext, QuoteRuntimeExecutor } from "../shared/integration-types";
import { createQuotePortStubBundle } from "../ports/quote-port-resolver";
import { createQuoteRuntimePortRegistry, mapExecutionToPortBinding } from "../ports/quote-port-registry";
import type { QuotePortBindingContext } from "../ports/quote-port-binding";
import type { QuoteRuntimePortRegistry } from "../ports/quote-port-registry";
import { createQuotePortExecutor } from "../services/quote-port-executor";

export interface QuoteRuntimePortBinding {
  workspaceId: string;
  execution: QuoteExecutionContext;
  portRegistry: QuoteRuntimePortRegistry;
  binding: QuotePortBindingContext;
  executor: QuoteRuntimeExecutor;
}

export function createQuoteRuntimePortBinding(input: {
  workspaceId: string;
  ports?: QuotePortRegistry;
}): QuoteRuntimePortBinding {
  const bridgeSnapshot = loadV55QuoteRuntimeSnapshot(input.workspaceId);
  const stubPorts = input.ports ?? createQuotePortStubBundle(bridgeSnapshot.snapshot);
  const portRegistry = createQuoteRuntimePortRegistry(stubPorts);
  const execution: QuoteExecutionContext = {
    workspaceId: input.workspaceId,
    snapshot: bridgeSnapshot.snapshot,
    ports: portRegistry.resolve(input.workspaceId),
  };
  const binding = mapExecutionToPortBinding(execution, portRegistry);
  const executor = createQuotePortExecutor(portRegistry);

  return {
    workspaceId: input.workspaceId,
    execution,
    portRegistry,
    binding,
    executor,
  };
}

export function runQuoteRuntimePortBinding(workspaceId: string): QuoteRuntimePortBinding {
  return createQuoteRuntimePortBinding({ workspaceId });
}
