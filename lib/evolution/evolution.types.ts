/**
 * Evolution P1 — AI Operations Optimization types
 */

import type {
  EFFICIENCY_BANDS,
  EVOLUTION_AI_OPS_OPTIMIZATION_BASE,
  EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION,
  EVOLUTION_AI_OPS_OPTIMIZATION_ID,
  EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
  EVOLUTION_MANAGER_STATUSES,
  EVOLUTION_READINESS_VERDICTS,
  IMPROVEMENT_STATUSES,
  INTELLIGENCE_SIGNAL_KINDS,
  OPTIMIZATION_PRIORITIES,
} from "./evolution.constants";

export type IntelligenceSignalKind = (typeof INTELLIGENCE_SIGNAL_KINDS)[number];
export type EfficiencyBand = (typeof EFFICIENCY_BANDS)[number];
export type OptimizationPriority = (typeof OPTIMIZATION_PRIORITIES)[number];
export type ImprovementStatus = (typeof IMPROVEMENT_STATUSES)[number];
export type EvolutionReadinessVerdict =
  (typeof EVOLUTION_READINESS_VERDICTS)[number];
export type EvolutionManagerStatus = (typeof EVOLUTION_MANAGER_STATUSES)[number];

export type EvolutionMetadata = Record<string, unknown>;

/** Operations intelligence model. */
export type IntelligenceSignal = {
  kind: IntelligenceSignalKind;
  score: number;
  detail: string;
};

export type OperationsIntelligenceProfile = {
  id: string;
  name: string;
  productId: string;
  orchestrationId: string;
  growthDashboardId?: string;
  supportSlaProfileId?: string;
  cloudRuntimeId?: string;
  signals: IntelligenceSignal[];
  intelligenceScore: number;
  detail: string;
  metadata: EvolutionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateOperationsIntelligenceInput = {
  id?: string;
  name: string;
  productId: string;
  orchestrationId: string;
  growthDashboardId?: string;
  supportSlaProfileId?: string;
  cloudRuntimeId?: string;
  metadata?: EvolutionMetadata;
};

/** Efficiency analysis. */
export type EfficiencyAnalysis = {
  id: string;
  intelligenceProfileId: string;
  band: EfficiencyBand;
  efficiencyScore: number;
  cloudScore: number;
  slaScore: number;
  growthScore: number;
  controlScore: number;
  bottlenecks: string[];
  detail: string;
  analyzedAt: string;
};

export type AnalyzeEfficiencyInput = {
  id?: string;
  intelligenceProfileId: string;
};

/** Optimization recommendation. */
export type OptimizationRecommendation = {
  id: string;
  intelligenceProfileId: string;
  efficiencyAnalysisId: string;
  priority: OptimizationPriority;
  title: string;
  action: string;
  expectedGain: number;
  detail: string;
  createdAt: string;
};

export type GenerateRecommendationsInput = {
  idPrefix?: string;
  intelligenceProfileId: string;
  efficiencyAnalysisId: string;
};

/** Resource insight. */
export type ResourceInsight = {
  id: string;
  intelligenceProfileId: string;
  runtimeHealthy: boolean;
  runtimeCount: number;
  slaComplianceRate?: number;
  openSlaIncidents: number;
  growthScore?: number;
  utilizationHint: string;
  detail: string;
  computedAt: string;
};

export type ComputeResourceInsightInput = {
  id?: string;
  intelligenceProfileId: string;
};

/** Improvement tracking. */
export type ImprovementRecord = {
  id: string;
  intelligenceProfileId: string;
  recommendationId: string;
  status: ImprovementStatus;
  progress: number;
  detail: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type TrackImprovementInput = {
  id?: string;
  intelligenceProfileId: string;
  recommendationId: string;
  status?: ImprovementStatus;
  progress?: number;
  detail?: string;
};

export type UpdateImprovementInput = {
  improvementId: string;
  status?: ImprovementStatus;
  progress?: number;
  detail?: string;
};

/** Readiness. */
export type EvolutionReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type EvolutionReadinessResult = {
  intelligenceProfileId: string;
  verdict: EvolutionReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: EvolutionReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type EvolutionRegistryManifest = {
  evolutionId: typeof EVOLUTION_AI_OPS_OPTIMIZATION_ID;
  version: typeof EVOLUTION_AI_OPS_OPTIMIZATION_VERSION;
  freezeVersion: typeof EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION;
  base: typeof EVOLUTION_AI_OPS_OPTIMIZATION_BASE;
  intelligenceCount: number;
  efficiencyCount: number;
  recommendationCount: number;
  resourceInsightCount: number;
  improvementCount: number;
};
