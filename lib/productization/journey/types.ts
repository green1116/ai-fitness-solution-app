export const CUSTOMER_JOURNEY_VERSION = "v8.2-customer-journey-1" as const;

export type CustomerJourneyStageKind =
  | "lead"
  | "qualified-lead"
  | "demo-requested"
  | "proposal-generated"
  | "trial-started"
  | "evaluation"
  | "commercial-negotiation"
  | "won"
  | "lost";

export type JourneyOutcome = "won" | "lost" | "in-progress";

export interface CustomerJourneyStage {
  id: string;
  kind: CustomerJourneyStageKind;
  order: number;
  label: string;
  description: string;
  terminal: boolean;
}

export interface JourneyTransition {
  id: string;
  from: CustomerJourneyStageKind;
  to: CustomerJourneyStageKind;
  label: string;
}

export interface ConversionMetrics {
  metricsId: string;
  leadCount: number;
  qualifiedLeadCount: number;
  demoRequests: number;
  proposalGenerated: number;
  trialStarted: number;
  evaluation: number;
  commercialNegotiation: number;
  won: number;
  lost: number;
  conversionRate: number;
  summary: string;
}

export interface JourneyAnalytics {
  analyticsId: string;
  version: typeof CUSTOMER_JOURNEY_VERSION;
  leadCount: number;
  demoRequests: number;
  proposalGenerated: number;
  trialStarted: number;
  evaluation: number;
  won: number;
  lost: number;
  conversionRate: number;
  funnelDropOff: Array<{ stage: CustomerJourneyStageKind; dropOffRate: number }>;
  summary: string;
}

export interface CustomerJourneyProfile {
  profileId: string;
  version: typeof CUSTOMER_JOURNEY_VERSION;
  productName: string;
  stages: CustomerJourneyStage[];
  transitions: JourneyTransition[];
  currentStage: CustomerJourneyStageKind;
  outcome: JourneyOutcome;
  summary: string;
}

export interface CustomerJourney {
  version: typeof CUSTOMER_JOURNEY_VERSION;
  journeyId: string;
  productName: string;
  profile: CustomerJourneyProfile;
  stages: CustomerJourneyStage[];
  transitions: JourneyTransition[];
  metrics: ConversionMetrics;
  analytics: JourneyAnalytics;
  summary: string;
}

export interface CustomerJourneyResponse {
  version: typeof CUSTOMER_JOURNEY_VERSION;
  journey: CustomerJourney;
  stages: CustomerJourneyStage[];
  metrics: ConversionMetrics;
  analytics: JourneyAnalytics;
}
