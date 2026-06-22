/**
 * V65 — Traffic acquisition engine
 */

import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import { recommendTrafficSources } from "./traffic.source.engine";
import { generateSEOContentBundle } from "../seo/seo.engine";
import { buildAdsStrategy } from "../ads/ads.strategy.engine";

export function runAcquisitionCampaign(channel: string): string[] {
  const actions: string[] = [];

  if (channel === "seo") {
    const seo = generateSEOContentBundle();
    actions.push(`Publish SEO content: ${seo.content.slug}`);
    actions.push(...seo.rankingActions.slice(0, 2));
  }

  if (channel === "ads") {
    const ads = buildAdsStrategy();
    actions.push(`Ads focus: ${ads.focus}`);
    for (const [ch, pct] of Object.entries(ads.budgetAllocation)) {
      actions.push(`Channel ${ch}: ${pct}%`);
    }
  }

  appendGrowthEvent({
    event: "growth.acquisition_campaign",
    meta: { channel, actions: actions.length, layer: "v65" },
  });

  return actions;
}

export function increaseQualityTraffic(): string[] {
  return [...recommendTrafficSources(), ...runAcquisitionCampaign("seo").slice(0, 1)];
}
