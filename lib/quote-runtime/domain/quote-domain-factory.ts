import type { QuoteContextSnapshot } from "../context/quote-context-snapshot";
import type { QuoteDomainFactory } from "./quote-domain-types";
import { createQuoteDomainView } from "./quote-domain-view";

export function createQuoteDomainFactory(): QuoteDomainFactory {
  return {
    createView(snapshot: QuoteContextSnapshot) {
      return createQuoteDomainView(snapshot);
    },
  };
}
