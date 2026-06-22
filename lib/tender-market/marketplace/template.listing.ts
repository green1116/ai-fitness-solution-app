/**
 * V64+ — Template marketplace listings
 */

import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import type { TemplatePriceTier } from "../tender-market.types";
import { listMarketplaceTemplates } from "./template.store";
import { trackTemplateUsage } from "../analytics/template.usage";

export function listTemplateMarketplace(filters?: {
  industry?: VerticalIndustry;
  tier?: TemplatePriceTier;
  freeOnly?: boolean;
}): ReturnType<typeof listMarketplaceTemplates> {
  let items = listMarketplaceTemplates();

  if (filters?.industry) {
    items = items.filter((t) => t.industry === filters.industry);
  }
  if (filters?.tier) {
    items = items.filter((t) => t.priceTier === filters.tier);
  }
  if (filters?.freeOnly) {
    items = items.filter((t) => t.isFree);
  }

  for (const item of items.slice(0, 3)) {
    trackTemplateUsage({ templateId: item.id, event: "view", industry: item.industry });
  }

  return items.sort((a, b) => {
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    return b.rating - a.rating;
  });
}

export function listTemplatesByIndustry(industry: VerticalIndustry) {
  return listTemplateMarketplace({ industry });
}

export function listFreeTemplates() {
  return listTemplateMarketplace({ freeOnly: true });
}

export function listPaidTemplates() {
  return listMarketplaceTemplates().filter((t) => !t.isFree);
}
