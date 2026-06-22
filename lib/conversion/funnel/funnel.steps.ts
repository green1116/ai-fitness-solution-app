/**
 * V64 P2 — Funnel step definitions
 */

export const CONVERSION_FUNNEL_STEPS = [
  "visitor",
  "landing_view",
  "demo_click",
  "demo_result",
  "signup",
  "activation",
  "paid",
] as const;

export type ConversionFunnelStep = (typeof CONVERSION_FUNNEL_STEPS)[number];

export const FUNNEL_STEP_EVENTS: Record<ConversionFunnelStep, string[]> = {
  visitor: ["visitor.landing", "visitor.utm"],
  landing_view: ["funnel.landing_view", "visitor.landing"],
  demo_click: ["funnel.demo_click", "demo.started"],
  demo_result: ["funnel.demo_result", "demo.completed"],
  signup: ["user.signup", "signup.clicked"],
  activation: ["user.activation", "quote.generated"],
  paid: ["payment.completed", "upgrade.clicked"],
};

export function describeConversionFunnel(): string[] {
  return [
    "Visitor → Landing View → Demo Click → Demo Result → Signup → Activation → Paid",
  ];
}
