import type { QuotePortRegistry } from "@/lib/quote-runtime/ports/quote-port-types";
import type { QuoteExecutionContext, QuoteRuntimePorts } from "../shared/integration-types";

export interface QuotePortBindingResolvedFlags {
  persistence: boolean;
  api: boolean;
  commercial: boolean;
}

export interface QuotePortBindingContext {
  execution: QuoteExecutionContext;
  ports: QuoteRuntimePorts;
  resolved: QuotePortBindingResolvedFlags;
}

export function resolvePortBindingFlags(ports: QuotePortRegistry): QuotePortBindingResolvedFlags {
  return {
    persistence:
      typeof ports.persistence?.loadQuoteSnapshot === "function" &&
      typeof ports.persistence?.exists === "function",
    api:
      typeof ports.api?.getQuoteSurface === "function" &&
      typeof ports.api?.getQuoteReadiness === "function",
    commercial:
      typeof ports.commercial?.getQuoteEligibility === "function" &&
      typeof ports.commercial?.getQuoteSurfaceFlags === "function",
  };
}

export function createQuotePortBindingContext(input: QuoteExecutionContext): QuotePortBindingContext {
  const resolved = resolvePortBindingFlags(input.ports);
  return {
    execution: {
      workspaceId: input.workspaceId,
      snapshot: input.snapshot,
      ports: input.ports,
    },
    ports: input.ports,
    resolved,
  };
}

export function assertQuotePortBindingContext(binding: QuotePortBindingContext): boolean {
  return (
    binding.execution.workspaceId === binding.execution.snapshot.workspaceId &&
    binding.resolved.persistence &&
    binding.resolved.api &&
    binding.resolved.commercial
  );
}

export function describeQuotePortBindingContext(binding: QuotePortBindingContext): string {
  return [
    `workspaceId=${binding.execution.workspaceId}`,
    `persistence=${binding.resolved.persistence}`,
    `api=${binding.resolved.api}`,
    `commercial=${binding.resolved.commercial}`,
  ].join(" ");
}
