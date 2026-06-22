/**
 * V60 P4 — Unified template engine
 */

import type { IndustryTemplateBundle, VerticalIndustry } from "../expansion.types";
import { loadIndustryTemplate } from "../verticals/vertical.registry";
import { getQuoteTemplate } from "./quote.templates";
import { getBudgetTemplate } from "./budget.templates";
import { getTenderTemplate } from "./tender.templates";

export function resolveTemplateBundle(industry: VerticalIndustry) {
  const bundle = loadIndustryTemplate(industry);
  return {
    bundle,
    quote: getQuoteTemplate(bundle.quote),
    budget: getBudgetTemplate(bundle.budget),
    tender: getTenderTemplate(bundle.tender),
  };
}

export function cloneTemplatesForVertical(
  source: VerticalIndustry,
  target: VerticalIndustry,
): IndustryTemplateBundle {
  const sourceBundle = loadIndustryTemplate(source);
  const targetBundle = loadIndustryTemplate(target);
  return {
    vertical: targetBundle.vertical,
    quote: targetBundle.quote,
    budget: targetBundle.budget,
    tender: targetBundle.tender,
    features: [...new Set([...sourceBundle.features, ...targetBundle.features])],
  };
}
