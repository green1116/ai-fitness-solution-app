/**
 * Evolution P7 — Evolution Control Plane types
 */

import type {
  EVOLUTION_CONTROL_PLANE_BASE,
  EVOLUTION_CONTROL_PLANE_FREEZE_VERSION,
  EVOLUTION_CONTROL_PLANE_ID,
  EVOLUTION_CONTROL_PLANE_VERSION,
  EVO_COMMAND_MODES,
  EVO_CONTROL_MANAGER_STATUSES,
  EVO_CONTROL_READINESS_VERDICTS,
  EVO_DECISION_VERDICTS,
  EVO_LOOP_STATUSES,
  EVO_ORCHESTRATION_DOMAINS,
  EVO_ORCHESTRATION_STATUSES,
} from "./control.constants";

export type EvoOrchestrationStatus =
  (typeof EVO_ORCHESTRATION_STATUSES)[number];
export type EvoOrchestrationDomain =
  (typeof EVO_ORCHESTRATION_DOMAINS)[number];
export type EvoCommandMode = (typeof EVO_COMMAND_MODES)[number];
export type EvoLoopStatus = (typeof EVO_LOOP_STATUSES)[number];
export type EvoDecisionVerdict = (typeof EVO_DECISION_VERDICTS)[number];
export type EvoControlReadinessVerdict =
  (typeof EVO_CONTROL_READINESS_VERDICTS)[number];
export type EvoControlManagerStatus =
  (typeof EVO_CONTROL_MANAGER_STATUSES)[number];

export type EvolutionControlMetadata = Record<string, unknown>;

export type EvoDomainBinding = {
  domain: EvoOrchestrationDomain;
  refId: string;
  label: string;
  present: boolean;
  score: number;
};

/** Evolution orchestration. */
export type EvolutionOrchestration = {
  id: string;
  name: string;
  productId: string;
  operationsIntelligenceId?: string;
  predictionModelId?: string;
  customerIntelligenceId?: string;
  intelligenceDashboardId?: string;
  deploymentIntelligenceId?: string;
  marketplaceId?: string;
  status: EvoOrchestrationStatus;
  domains: EvoDomainBinding[];
  detail: string;
  metadata: EvolutionControlMetadata;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
};

export type CreateEvolutionOrchestrationInput = {
  id?: string;
  name: string;
  productId: string;
  operationsIntelligenceId?: string;
  predictionModelId?: string;
  customerIntelligenceId?: string;
  intelligenceDashboardId?: string;
  deploymentIntelligenceId?: string;
  marketplaceId?: string;
  metadata?: EvolutionControlMetadata;
};

/** Intelligence command center. */
export type IntelligenceCommandCenter = {
  id: string;
  orchestrationId: string;
  mode: EvoCommandMode;
  focusDomains: EvoOrchestrationDomain[];
  alerts: string[];
  commandScore: number;
  detail: string;
  builtAt: string;
};

export type BuildCommandCenterInput = {
  id?: string;
  orchestrationId: string;
};

/** Autonomous improvement loop. */
export type AutonomousImprovementLoop = {
  id: string;
  orchestrationId: string;
  status: EvoLoopStatus;
  iteration: number;
  improvementDelta: number;
  actions: string[];
  detail: string;
  startedAt: string;
  updatedAt: string;
};

export type RunImprovementLoopInput = {
  id?: string;
  orchestrationId: string;
  iterations?: number;
};

/** Cross-layer decision engine. */
export type EvolutionDecision = {
  id: string;
  orchestrationId: string;
  verdict: EvoDecisionVerdict;
  confidence: number;
  reasons: string[];
  recommendedActions: string[];
  detail: string;
  decidedAt: string;
};

export type DecideEvolutionInput = {
  id?: string;
  orchestrationId: string;
};

/** Evolution metrics. */
export type EvolutionMetrics = {
  id: string;
  orchestrationId: string;
  overallScore: number;
  domainCoverage: number;
  optimizationScore: number;
  predictiveScore: number;
  customerScore: number;
  dashboardScore: number;
  globalScore: number;
  marketplaceScore: number;
  detail: string;
  computedAt: string;
};

export type ComputeEvolutionMetricsInput = {
  id?: string;
  orchestrationId: string;
};

/** Readiness. */
export type EvoControlReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvoControlReadinessResult = {
  orchestrationId: string;
  verdict: EvoControlReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvoControlReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvoControlRegistryManifest = {
  controlPlaneId: typeof EVOLUTION_CONTROL_PLANE_ID;
  version: typeof EVOLUTION_CONTROL_PLANE_VERSION;
  freezeVersion: typeof EVOLUTION_CONTROL_PLANE_FREEZE_VERSION;
  base: typeof EVOLUTION_CONTROL_PLANE_BASE;
  orchestrationCount: number;
  commandCenterCount: number;
  loopCount: number;
  decisionCount: number;
  metricsCount: number;
};
