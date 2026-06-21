/**
 * V60 P1 — Growth funnel model & core metrics
 */

export type FunnelStage = "acquisition" | "activation" | "conversion" | "retention";

export interface GrowthMetrics {
  visitors: number;
  signups: number;
  activatedUsers: number;
  firstQuoteGenerated: number;
  paidUsers: number;
  churnRate: number;
  retentionRate: number;
}

export type GrowthEventName =
  | "visitor.landing"
  | "visitor.utm"
  | "user.signup"
  | "user.activation"
  | "project.created"
  | "quote.generated"
  | "budget.calculated"
  | "tender.generated"
  | "paywall.shown"
  | "upgrade.clicked"
  | "payment.completed"
  | "session.return";

export const FUNNEL_STAGE_EVENTS: Record<FunnelStage, GrowthEventName[]> = {
  acquisition: ["visitor.landing", "visitor.utm"],
  activation: ["user.signup", "user.activation", "project.created", "quote.generated"],
  conversion: ["paywall.shown", "upgrade.clicked", "payment.completed"],
  retention: ["session.return", "quote.generated", "budget.calculated", "tender.generated"],
};

export const ONBOARDING_STEPS = [
  "create_account",
  "create_organization",
  "create_first_project",
  "generate_first_quote",
  "show_value_output",
  "upgrade_prompt",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type OnboardingState = {
  userId: string;
  organizationId?: string;
  completedSteps: OnboardingStep[];
  currentStep: OnboardingStep;
  activated: boolean;
};

export function createEmptyGrowthMetrics(): GrowthMetrics {
  return {
    visitors: 0,
    signups: 0,
    activatedUsers: 0,
    firstQuoteGenerated: 0,
    paidUsers: 0,
    churnRate: 0,
    retentionRate: 0,
  };
}

export function resolveFunnelStage(event: GrowthEventName): FunnelStage {
  for (const [stage, events] of Object.entries(FUNNEL_STAGE_EVENTS) as [FunnelStage, GrowthEventName[]][]) {
    if (events.includes(event)) return stage;
  }
  return "acquisition";
}

export function resolveNextOnboardingStep(completed: OnboardingStep[]): OnboardingStep {
  for (const step of ONBOARDING_STEPS) {
    if (!completed.includes(step)) return step;
  }
  return "upgrade_prompt";
}

export function isOnboardingComplete(completed: OnboardingStep[]): boolean {
  return ONBOARDING_STEPS.every((s) => completed.includes(s));
}
