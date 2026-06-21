/**
 * V65 — Universe builder
 */

import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import { scaleProductAcrossIndustries } from "@/lib/expansion/expansion.engine";
import type { IndustryUniverse } from "./universe.types";
import { UNIVERSE_INDUSTRY_CATALOG } from "./universe.types";
import { generateSaaSInstance } from "./product.generator";
import { getSaaSInstancesSnapshot, countInstancesByIndustry } from "./universe.store";

export function createIndustryUniverse(industry: VerticalIndustry): IndustryUniverse {
  const catalog = UNIVERSE_INDUSTRY_CATALOG.find((c) => c.industry === industry);
  const existing = getSaaSInstancesSnapshot().filter((i) => i.industry === industry);

  const instances =
    existing.length > 0
      ? existing
      : [generateSaaSInstance({ industry })];

  const totalMrr = instances.reduce((s, i) => s + i.mrr, 0);

  return {
    id: `universe-${industry}`,
    industry,
    label: catalog?.label ?? industry,
    instances,
    totalMrr,
  };
}

export function buildBusinessUniverse(): IndustryUniverse[] {
  const industries = scaleProductAcrossIndustries().map((t) => t.vertical);
  const unique = [...new Set(industries)] as VerticalIndustry[];

  return unique.map((industry) => {
    if (countInstancesByIndustry(industry) === 0) {
      generateSaaSInstance({ industry });
    }
    return createIndustryUniverse(industry);
  });
}

export function getUniverseSummary(): {
  universeCount: number;
  instanceCount: number;
  industries: string[];
} {
  const universes = buildBusinessUniverse();
  return {
    universeCount: universes.length,
    instanceCount: universes.reduce((s, u) => s + u.instances.length, 0),
    industries: universes.map((u) => u.label),
  };
}
