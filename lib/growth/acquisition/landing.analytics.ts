/**
 * V60 P1 — Landing page analytics
 */

import { trackLandingVisit } from "../analytics.events";

export function trackLandingPageView(input?: {
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  trackLandingVisit({
    source: input?.path ?? input?.referrer ?? "landing",
    utmSource: input?.utmSource,
    utmMedium: input?.utmMedium,
    utmCampaign: input?.utmCampaign,
  });
}

export function parseUtmFromSearchParams(params: URLSearchParams): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
  };
}
