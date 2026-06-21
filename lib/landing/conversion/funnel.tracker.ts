/**
 * V64 P1 — Marketing funnel tracker
 */

import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export type FunnelStage =
  | "visitor"
  | "landing"
  | "demo_click"
  | "demo_result"
  | "signup"
  | "first_quote"
  | "activation";

const STAGE_EVENTS: Record<FunnelStage, string> = {
  visitor: "visitor.landing",
  landing: "funnel.landing_view",
  demo_click: "funnel.demo_click",
  demo_result: "funnel.demo_result",
  signup: "user.signup",
  first_quote: "quote.generated",
  activation: "user.activation",
};

export function trackFunnelStage(stage: FunnelStage, meta?: Record<string, unknown>) {
  appendGrowthEvent({
    event: STAGE_EVENTS[stage],
    meta: { funnelStage: stage, ...meta, layer: "v64-p1" },
  });
}

export function getFunnelStageOrder(): FunnelStage[] {
  return ["visitor", "landing", "demo_click", "demo_result", "signup", "first_quote", "activation"];
}

export function describeFunnel(): string[] {
  return [
    "Visitor → Landing Page → Demo Click → Demo Result → Signup → First Quote → Activation",
  ];
}
