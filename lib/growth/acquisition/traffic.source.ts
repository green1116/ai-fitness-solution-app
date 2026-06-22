/**
 * V60 P1 — Traffic source attribution
 */

import { appendGrowthEvent } from "../growth.events.store";

export type TrafficSource = "organic" | "paid" | "referral" | "direct" | "campaign" | "unknown";

export function classifyTrafficSource(input: {
  utmSource?: string;
  utmMedium?: string;
  referrer?: string;
}): TrafficSource {
  const medium = input.utmMedium?.toLowerCase() ?? "";
  const source = input.utmSource?.toLowerCase() ?? "";

  if (medium.includes("cpc") || medium.includes("paid")) return "paid";
  if (source.includes("google") || source.includes("bing")) return "organic";
  if (input.utmSource || input.utmMedium) return "campaign";
  if (input.referrer) return "referral";
  return "direct";
}

export function trackTrafficSource(input: {
  source: TrafficSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPath?: string;
}) {
  appendGrowthEvent({
    event: "visitor.utm",
    source: input.source,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    meta: { landingPath: input.landingPath, classified: input.source },
  });
}

export function classifyTrafficSourceServer(input: {
  utmSource?: string;
  utmMedium?: string;
  referrer?: string;
}): TrafficSource {
  const medium = input.utmMedium?.toLowerCase() ?? "";
  const source = input.utmSource?.toLowerCase() ?? "";

  if (medium.includes("cpc") || medium.includes("paid")) return "paid";
  if (source.includes("google") || source.includes("bing")) return "organic";
  if (input.utmSource || input.utmMedium) return "campaign";
  if (input.referrer) return "referral";
  return "direct";
}
