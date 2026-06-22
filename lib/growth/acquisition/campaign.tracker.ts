/**
 * V60 P1 — Campaign tracking
 */

import { appendGrowthEvent } from "../growth.events.store";

export type CampaignRecord = {
  campaignId: string;
  name: string;
  channel: string;
};

export function trackCampaignVisit(input: {
  campaignId: string;
  campaignName?: string;
  channel?: string;
  utmSource?: string;
  utmMedium?: string;
}) {
  appendGrowthEvent({
    event: "visitor.utm",
    campaign: input.campaignId,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    meta: {
      campaignId: input.campaignId,
      campaignName: input.campaignName,
      channel: input.channel ?? "unknown",
    },
  });
}

export function buildCampaignRecord(input: {
  campaignId: string;
  name: string;
  channel: string;
}): CampaignRecord {
  return { campaignId: input.campaignId, name: input.name, channel: input.channel };
}
