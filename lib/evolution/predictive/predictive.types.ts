/**
 * Evolution P2 — Predictive Intelligence types
 */

import type {
  CAPACITY_OUTLOOKS,
  CUSTOMER_RISK_LEVELS,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION,
  INCIDENT_PREDICTION_LEVELS,
  PREDICTION_HORIZONS,
  PREDICTIVE_MANAGER_STATUSES,
  PREDICTIVE_READINESS_VERDICTS,
  RISK_BANDS,
} from "./predictive.constants";

export type PredictionHorizon = (typeof PREDICTION_HORIZONS)[number];
export type IncidentPredictionLevel =
  (typeof INCIDENT_PREDICTION_LEVELS)[number];
export type RiskBand = (typeof RISK_BANDS)[number];
export type CapacityOutlook = (typeof CAPACITY_OUTLOOKS)[number];
export type CustomerRiskLevel = (typeof CUSTOMER_RISK_LEVELS)[number];
export type PredictiveReadinessVerdict =
  (typeof PREDICTIVE_READINESS_VERDICTS)[number];
export type PredictiveManagerStatus =
  (typeof PREDICTIVE_MANAGER_STATUSES)[number];

export type PredictiveMetadata = Record<string, unknown>;

/** Prediction model. */
export type PredictionModel = {
  id: string;
  name: string;
  productId: string;
  intelligenceProfileId: string;
  growthDashboardId?: string;
  customerHealthProfileId?: string;
  cloudRuntimeId?: string;
  horizon: PredictionHorizon;
  confidence: number;
  detail: string;
  metadata: PredictiveMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreatePredictionModelInput = {
  id?: string;
  name: string;
  productId: string;
  intelligenceProfileId: string;
  growthDashboardId?: string;
  customerHealthProfileId?: string;
  cloudRuntimeId?: string;
  horizon?: PredictionHorizon;
  metadata?: PredictiveMetadata;
};

/** Incident prediction. */
export type IncidentPrediction = {
  id: string;
  predictionModelId: string;
  level: IncidentPredictionLevel;
  probability: number;
  openIncidentCount: number;
  recentSeverityPressure: number;
  drivers: string[];
  detail: string;
  predictedAt: string;
};

export type PredictIncidentInput = {
  id?: string;
  predictionModelId: string;
};

/** Risk scoring. */
export type RiskScore = {
  id: string;
  predictionModelId: string;
  band: RiskBand;
  score: number;
  incidentComponent: number;
  capacityComponent: number;
  customerComponent: number;
  growthComponent: number;
  detail: string;
  scoredAt: string;
};

export type ScoreRiskInput = {
  id?: string;
  predictionModelId: string;
  incidentPredictionId?: string;
  capacityForecastId?: string;
  customerRiskSignalId?: string;
};

/** Capacity forecasting. */
export type CapacityForecast = {
  id: string;
  predictionModelId: string;
  outlook: CapacityOutlook;
  projectedUtilization: number;
  headroom: number;
  runtimeHealthy: boolean;
  growthPressure: number;
  detail: string;
  forecastAt: string;
};

export type ForecastCapacityInput = {
  id?: string;
  predictionModelId: string;
};

/** Customer risk signals. */
export type CustomerRiskSignal = {
  id: string;
  predictionModelId: string;
  customerHealthProfileId: string;
  level: CustomerRiskLevel;
  riskScore: number;
  healthScore: number;
  growthScore?: number;
  signals: string[];
  detail: string;
  detectedAt: string;
};

export type DetectCustomerRiskInput = {
  id?: string;
  predictionModelId: string;
  customerHealthProfileId?: string;
};

/** Readiness. */
export type PredictiveReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PredictiveReadinessResult = {
  predictionModelId: string;
  verdict: PredictiveReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: PredictiveReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type PredictiveRegistryManifest = {
  predictiveId: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_ID;
  version: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION;
  freezeVersion: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION;
  base: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE;
  modelCount: number;
  incidentPredictionCount: number;
  riskScoreCount: number;
  capacityForecastCount: number;
  customerRiskSignalCount: number;
};
