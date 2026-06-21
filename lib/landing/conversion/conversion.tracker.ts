/**
 * V64 P1 — Landing conversion tracker
 */

import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import { trackLandingPageView } from "@/lib/growth/acquisition/landing.analytics";

export function trackLandingView(input?: {
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  trackLandingPageView(input);
  appendGrowthEvent({
    event: "visitor.landing",
    source: input?.path ?? "v64-landing",
    utmSource: input?.utmSource,
    utmMedium: input?.utmMedium,
    utmCampaign: input?.utmCampaign,
    meta: { layer: "v64-p1" },
  });
}

export function trackDemoStart(input?: { companyName?: string; sessionId?: string }) {
  appendGrowthEvent({
    event: "demo.started",
    meta: { companyName: input?.companyName, sessionId: input?.sessionId, layer: "v64-p1" },
  });
}

export function trackDemoComplete(input?: {
  sessionId?: string;
  hasQuote?: boolean;
  hasBudget?: boolean;
  hasTender?: boolean;
}) {
  appendGrowthEvent({
    event: "demo.completed",
    meta: { ...input, layer: "v64-p1" },
  });
}

export function trackSignupClick(input?: { source?: string; cta?: string }) {
  appendGrowthEvent({
    event: "signup.clicked",
    source: input?.source ?? "landing",
    meta: { cta: input?.cta, layer: "v64-p1" },
  });
}

export function trackConversion(input?: {
  stage: "visitor" | "demo" | "signup" | "activation";
  organizationId?: string;
  userId?: string;
}) {
  appendGrowthEvent({
    event: "conversion.stage",
    userId: input?.userId,
    organizationId: input?.organizationId,
    meta: { stage: input?.stage, layer: "v64-p1" },
  });
}
