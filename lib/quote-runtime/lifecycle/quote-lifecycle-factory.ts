import type { QuoteDomainView } from "../domain/quote-domain-types";
import type { QuoteLifecycleFactory } from "./quote-lifecycle-types";
import { createQuoteLifecycleView } from "./quote-lifecycle-view";

export function createQuoteLifecycleFactory(): QuoteLifecycleFactory {
  return {
    createView(domainView: QuoteDomainView) {
      return createQuoteLifecycleView(domainView);
    },
  };
}
