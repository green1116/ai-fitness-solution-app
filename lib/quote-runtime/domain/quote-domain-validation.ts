import type { QuoteContextSnapshot } from "../context/quote-context-snapshot";
import { createQuoteDomainFactory } from "./quote-domain-factory";
import { validateQuoteDomainView } from "./quote-domain-guards";
import { createQuoteDomainRegistry, registerQuoteDomainView } from "./quote-domain-registry";
import type { QuoteDomainValidation } from "./quote-domain-types";
import { assertQuoteDomainViewShape, describeQuoteDomainView } from "./quote-domain-view";

export function validateQuoteDomain(snapshot: QuoteContextSnapshot): QuoteDomainValidation {
  const factory = createQuoteDomainFactory();
  const view = factory.createView(snapshot);
  const guard = validateQuoteDomainView(view);
  const registry = createQuoteDomainRegistry();
  registerQuoteDomainView(registry, view);

  const valid =
    assertQuoteDomainViewShape(view) &&
    guard.valid &&
    registry.has(view.workspaceId) &&
    registry.resolve(view.workspaceId)?.domainState === view.domainState;

  return {
    valid,
    summary: [
      describeQuoteDomainView(view),
      guard.summary,
      `registered=${registry.has(view.workspaceId)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
