import type { QuoteDomainView } from "../domain/quote-domain-types";
import { createQuoteLifecycleFactory } from "./quote-lifecycle-factory";
import { validateQuoteLifecycleView } from "./quote-lifecycle-guards";
import { createQuoteLifecycleRegistry, registerQuoteLifecycleView } from "./quote-lifecycle-registry";
import type { QuoteLifecycleValidation } from "./quote-lifecycle-types";
import { assertQuoteLifecycleViewShape, describeQuoteLifecycleView } from "./quote-lifecycle-view";

export function validateQuoteLifecycle(domainView: QuoteDomainView): QuoteLifecycleValidation {
  const factory = createQuoteLifecycleFactory();
  const view = factory.createView(domainView);
  const guard = validateQuoteLifecycleView(view);
  const registry = createQuoteLifecycleRegistry();
  registerQuoteLifecycleView(registry, view);

  const valid =
    assertQuoteLifecycleViewShape(view) &&
    guard.valid &&
    registry.has(view.workspaceId) &&
    registry.resolve(view.workspaceId)?.lifecycleStatus === view.lifecycleStatus;

  return {
    valid,
    summary: [
      describeQuoteLifecycleView(view),
      guard.summary,
      `registered=${registry.has(view.workspaceId)}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
