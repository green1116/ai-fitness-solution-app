import type { QuotePortRegistry, QuotePortRegistryStub } from "./quote-port-types";

export function createQuotePortRegistry(ports: QuotePortRegistry): QuotePortRegistryStub {
  return Object.freeze({
    persistence: ports.persistence,
    api: ports.api,
    commercial: ports.commercial,
  });
}
