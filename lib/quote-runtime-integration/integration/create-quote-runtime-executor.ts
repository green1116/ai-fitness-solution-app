import type { QuotePortRegistry } from "@/lib/quote-runtime/ports/quote-port-types";
import { loadV55QuoteRuntimeSnapshot } from "../bridge/quote-runtime-bridge";
import type {
  QuoteExecutionContext,
  QuoteExecutionResult,
  QuoteRuntimeExecutor,
  QuoteRuntimeIntegrationService,
} from "../shared/integration-types";
import { createQuoteExecution, createQuoteRuntimeIntegrationService } from "../services/quote-execution.service";
import { createQuoteRuntimeOrchestrator } from "../services/quote-runtime-orchestrator";

export interface QuoteRuntimeIntegration {
  workspaceId: string;
  snapshot: QuoteExecutionContext["snapshot"];
  ports: QuotePortRegistry;
  executor: QuoteRuntimeExecutor;
  service: QuoteRuntimeIntegrationService;
}

export function createQuoteRuntimeExecutor(ports: QuotePortRegistry): QuoteRuntimeExecutor {
  return createQuoteRuntimeOrchestrator(ports);
}

export function createQuoteRuntimeIntegration(input: {
  workspaceId: string;
  ports: QuotePortRegistry;
}): QuoteRuntimeIntegration {
  const bridgeSnapshot = loadV55QuoteRuntimeSnapshot(input.workspaceId);
  const executor = createQuoteRuntimeExecutor(input.ports);
  const service = createQuoteRuntimeIntegrationService();

  return {
    workspaceId: input.workspaceId,
    snapshot: bridgeSnapshot.snapshot,
    ports: input.ports,
    executor,
    service,
  };
}

export function runQuoteRuntimeIntegration(input: {
  workspaceId: string;
  ports: QuotePortRegistry;
}): QuoteExecutionResult {
  const integration = createQuoteRuntimeIntegration(input);
  return integration.service.createQuoteExecution({
    workspaceId: integration.workspaceId,
    snapshot: integration.snapshot,
    ports: integration.ports,
  });
}

export function assertPortEnforcedExecution(context: QuoteExecutionContext): boolean {
  return Boolean(context.ports?.persistence && context.ports?.api && context.ports?.commercial);
}

export { createQuoteExecution };
