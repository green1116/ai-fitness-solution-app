import { buildJourneyAnalytics } from "./analytics";
import { buildConversionMetrics } from "./conversion";
import { buildJourneyStages } from "./stages";
import type {
  CustomerJourney,
  CustomerJourneyProfile,
  CustomerJourneyResponse,
  CustomerJourneyStageKind,
  JourneyOutcome,
  JourneyTransition,
} from "./types";
import { CUSTOMER_JOURNEY_VERSION } from "./types";

const PRODUCT_NAME = "AI Fitness Solution";

const TRANSITION_DEFINITIONS: readonly Omit<JourneyTransition, "id">[] = [
  { from: "lead", to: "qualified-lead", label: "Qualify lead" },
  { from: "qualified-lead", to: "demo-requested", label: "Request demo" },
  { from: "demo-requested", to: "proposal-generated", label: "Generate proposal" },
  { from: "proposal-generated", to: "trial-started", label: "Start trial" },
  { from: "trial-started", to: "evaluation", label: "Begin evaluation" },
  { from: "evaluation", to: "commercial-negotiation", label: "Enter negotiation" },
  { from: "commercial-negotiation", to: "won", label: "Close won" },
  { from: "commercial-negotiation", to: "lost", label: "Close lost" },
];

export function buildJourneyTransitions(): JourneyTransition[] {
  return TRANSITION_DEFINITIONS.map((transition) => ({
    id: `transition-${transition.from}-to-${transition.to}`,
    ...transition,
  }));
}

export function validateTransitions(): boolean {
  const stages = buildJourneyStages();
  const stageKinds = new Set(stages.map((s) => s.kind));
  const transitions = buildJourneyTransitions();
  return transitions.every((t) => stageKinds.has(t.from) && stageKinds.has(t.to));
}

export function getTransitionsFrom(stage: CustomerJourneyStageKind): JourneyTransition[] {
  return buildJourneyTransitions().filter((t) => t.from === stage);
}

export function getTransitionsTo(stage: CustomerJourneyStageKind): JourneyTransition[] {
  return buildJourneyTransitions().filter((t) => t.to === stage);
}

export function buildJourneyProfile(input?: {
  deploymentId?: string;
  currentStage?: CustomerJourneyStageKind;
  outcome?: JourneyOutcome;
}): CustomerJourneyProfile {
  const deploymentId = input?.deploymentId ?? "customer-journey-default";
  const stages = buildJourneyStages();
  const transitions = buildJourneyTransitions();
  const currentStage = input?.currentStage ?? "lead";
  const outcome = input?.outcome ?? "in-progress";

  return {
    profileId: `journey-profile-${deploymentId}`,
    version: CUSTOMER_JOURNEY_VERSION,
    productName: PRODUCT_NAME,
    stages,
    transitions,
    currentStage,
    outcome,
    summary: [
      `journey-profile product=${PRODUCT_NAME}`,
      `stages=${stages.length}`,
      `transitions=${transitions.length}`,
      `currentStage=${currentStage}`,
      `outcome=${outcome}`,
    ].join(" "),
  };
}

export function buildCustomerJourney(input?: {
  deploymentId?: string;
}): CustomerJourney {
  const deploymentId = input?.deploymentId ?? "customer-journey-default";
  const profile = buildJourneyProfile({ deploymentId });
  const stages = buildJourneyStages();
  const transitions = buildJourneyTransitions();
  const metrics = buildConversionMetrics({ deploymentId });
  const analytics = buildJourneyAnalytics({ deploymentId });

  return {
    version: CUSTOMER_JOURNEY_VERSION,
    journeyId: `customer-journey-${deploymentId}`,
    productName: PRODUCT_NAME,
    profile,
    stages,
    transitions,
    metrics,
    analytics,
    summary: [
      `customer-journey product=${PRODUCT_NAME}`,
      `stages=${stages.length}`,
      `transitions=${transitions.length}`,
      `conversionRate=${metrics.conversionRate}%`,
    ].join(" "),
  };
}

export function buildCustomerJourneyResponse(input?: {
  deploymentId?: string;
}): CustomerJourneyResponse {
  const deploymentId = input?.deploymentId ?? "customer-journey-default";
  const journey = buildCustomerJourney({ deploymentId });
  return {
    version: CUSTOMER_JOURNEY_VERSION,
    journey,
    stages: journey.stages,
    metrics: journey.metrics,
    analytics: journey.analytics,
  };
}

export function validateJourney(input?: { deploymentId?: string }): {
  stagesExist: boolean;
  transitionsValid: boolean;
  analyticsValid: boolean;
  conversionMetricsValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "customer-journey-default";
  const stages = buildJourneyStages();
  const transitionsValid = validateTransitions();
  const metrics = buildConversionMetrics({ deploymentId });
  const analytics = buildJourneyAnalytics({ deploymentId });

  const stagesExist = stages.length >= 9;
  const analyticsValid =
    analytics.leadCount > 0 &&
    analytics.conversionRate >= 0 &&
    analytics.funnelDropOff.length > 0;
  const conversionMetricsValid =
    metrics.leadCount > 0 &&
    metrics.won >= 0 &&
    metrics.lost >= 0 &&
    metrics.conversionRate === Math.round((metrics.won / metrics.leadCount) * 1000) / 10;

  return { stagesExist, transitionsValid, analyticsValid, conversionMetricsValid };
}
