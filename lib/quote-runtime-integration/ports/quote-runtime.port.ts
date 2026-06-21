import type { QuotePortRegistry } from "@/lib/quote-runtime/ports/quote-port-types";
import type { QuoteRuntimeExecutor, QuoteRuntimeIntegrationService } from "../shared/integration-types";
import {
  createQuotePortResolver,
  type QuotePortResolver,
} from "./quote-port-resolver";

export interface QuoteRuntimePortBundle {
  persistence: QuotePortRegistry["persistence"];
  api: QuotePortRegistry["api"];
  commercial: QuotePortRegistry["commercial"];
}

/** @deprecated Use QuotePortResolver from quote-port-resolver */
export type QuoteRuntimePortResolver = QuotePortResolver;

export function createQuoteRuntimePortResolver(ports: QuotePortRegistry): QuotePortResolver {
  return createQuotePortResolver(ports);
}

export type { QuoteRuntimeExecutor, QuoteRuntimeIntegrationService, QuotePortResolver };
