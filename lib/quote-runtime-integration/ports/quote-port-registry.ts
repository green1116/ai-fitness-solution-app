import { createQuotePortRegistry } from "@/lib/quote-runtime/ports";
import type { QuotePortRegistry, QuotePortRegistryStub } from "@/lib/quote-runtime/ports/quote-port-types";
import type { QuoteExecutionContext } from "../shared/integration-types";
import { createQuotePortBindingContext, type QuotePortBindingContext } from "./quote-port-binding";
import { createQuotePortResolver, type QuotePortResolver } from "./quote-port-resolver";

export interface QuoteRuntimePortRegistry {
  registry: QuotePortRegistryStub;
  resolver: QuotePortResolver;
  resolve(workspaceId: string): QuotePortRegistry;
  bind(execution: QuoteExecutionContext): QuotePortBindingContext;
}

export function createQuoteRuntimePortRegistry(ports: QuotePortRegistry): QuoteRuntimePortRegistry {
  const registry = createQuotePortRegistry(ports);
  const resolver = createQuotePortResolver(ports);

  return {
    registry,
    resolver,
    resolve(workspaceId: string): QuotePortRegistry {
      return resolver.resolve(workspaceId);
    },
    bind(execution: QuoteExecutionContext): QuotePortBindingContext {
      const resolvedPorts = resolver.resolve(execution.workspaceId);
      return createQuotePortBindingContext({
        ...execution,
        ports: resolvedPorts,
      });
    },
  };
}

export function mapExecutionToPortBinding(
  execution: QuoteExecutionContext,
  portRegistry: QuoteRuntimePortRegistry,
): QuotePortBindingContext {
  return portRegistry.bind(execution);
}
