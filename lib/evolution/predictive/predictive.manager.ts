/**
 * Evolution P2 — Predictive Intelligence Manager
 */

import { listRuntimes } from "../../cloud-runtime/e11/registry/cloud.registry";
import { getCustomerSuccessRegistryManifest } from "../../operations/customer-success/success.manager";
import { getGrowthRegistryManifest } from "../../operations/growth/growth.manager";
import { getIncidentRegistryManifest } from "../../operations/incident/incident.manager";
import { getEvolutionRegistryManifest } from "../evolution.manager";
import {
  EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION,
} from "./predictive.constants";
import {
  clearCapacityForecasts,
  forecastCapacity,
  getCapacityForecast,
  listCapacityForecasts,
} from "./predictive.capacity";
import {
  clearCustomerRiskSignals,
  detectCustomerRisk,
  getCustomerRiskSignal,
  listCustomerRiskSignals,
} from "./predictive.customer";
import {
  clearIncidentPredictions,
  getIncidentPrediction,
  listIncidentPredictions,
  predictIncident,
} from "./predictive.incident";
import {
  clearPredictionModels,
  createPredictionModel,
  getPredictionModel,
  listPredictionModels,
} from "./predictive.model";
import {
  assertPredictiveReadinessReady,
  evaluatePredictiveReadiness,
} from "./predictive.readiness";
import {
  clearRiskScores,
  getRiskScore,
  listRiskScores,
  scorePredictiveRisk,
} from "./predictive.risk";
import type {
  CapacityForecast,
  CreatePredictionModelInput,
  CustomerRiskSignal,
  DetectCustomerRiskInput,
  ForecastCapacityInput,
  IncidentPrediction,
  PredictIncidentInput,
  PredictionModel,
  PredictiveManagerStatus,
  PredictiveReadinessResult,
  PredictiveRegistryManifest,
  RiskScore,
  ScoreRiskInput,
} from "./predictive.types";

export type PredictiveManagerSnapshot = {
  managerId: string;
  status: PredictiveManagerStatus;
  layerId: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_ID;
  version: typeof EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION;
  modelCount: number;
  incidentPredictionCount: number;
  riskScoreCount: number;
  capacityForecastCount: number;
  customerRiskSignalCount: number;
  intelligenceCount: number;
  incidentOpsCount: number;
  growthDashboardCount: number;
  customerHealthCount: number;
  cloudRuntimeCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type PredictiveIntelligenceManager = {
  initialize: () => PredictiveManagerSnapshot;
  start: () => PredictiveManagerSnapshot;
  stop: () => PredictiveManagerSnapshot;
  status: () => PredictiveManagerSnapshot;
  createModel: (input: CreatePredictionModelInput) => PredictionModel;
  getModel: typeof getPredictionModel;
  listModels: typeof listPredictionModels;
  predictIncident: (input: PredictIncidentInput) => IncidentPrediction;
  getIncidentPrediction: typeof getIncidentPrediction;
  listIncidentPredictions: typeof listIncidentPredictions;
  forecastCapacity: (input: ForecastCapacityInput) => CapacityForecast;
  getCapacityForecast: typeof getCapacityForecast;
  listCapacityForecasts: typeof listCapacityForecasts;
  detectCustomerRisk: (input: DetectCustomerRiskInput) => CustomerRiskSignal;
  getCustomerRisk: typeof getCustomerRiskSignal;
  listCustomerRisks: typeof listCustomerRiskSignals;
  scoreRisk: (input: ScoreRiskInput) => RiskScore;
  getRiskScore: typeof getRiskScore;
  listRiskScores: typeof listRiskScores;
  evaluateReadiness: (predictionModelId: string) => PredictiveReadinessResult;
  manifest: () => PredictiveRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getPredictiveRegistryManifest(): PredictiveRegistryManifest {
  return {
    predictiveId: EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
    version: EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION,
    freezeVersion: EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION,
    base: EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE,
    modelCount: listPredictionModels().length,
    incidentPredictionCount: listIncidentPredictions().length,
    riskScoreCount: listRiskScores().length,
    capacityForecastCount: listCapacityForecasts().length,
    customerRiskSignalCount: listCustomerRiskSignals().length,
  };
}

export function clearPredictiveLayer(): void {
  clearRiskScores();
  clearCustomerRiskSignals();
  clearCapacityForecasts();
  clearIncidentPredictions();
  clearPredictionModels();
}

export function createPredictiveIntelligenceManager(options?: {
  managerId?: string;
}): PredictiveIntelligenceManager {
  const managerId =
    options?.managerId?.trim() || createId("evo-p2-pred-mgr");
  let state: PredictiveManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PredictiveManagerSnapshot {
    const evoReg = getEvolutionRegistryManifest();
    const incidentReg = getIncidentRegistryManifest();
    const growthReg = getGrowthRegistryManifest();
    const csReg = getCustomerSuccessRegistryManifest();
    const reg = getPredictiveRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
      version: EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION,
      modelCount: reg.modelCount,
      incidentPredictionCount: reg.incidentPredictionCount,
      riskScoreCount: reg.riskScoreCount,
      capacityForecastCount: reg.capacityForecastCount,
      customerRiskSignalCount: reg.customerRiskSignalCount,
      intelligenceCount: evoReg.intelligenceCount,
      incidentOpsCount: incidentReg.incidentCount,
      growthDashboardCount: growthReg.dashboardCount,
      customerHealthCount: csReg.healthProfileCount,
      cloudRuntimeCount: listRuntimes().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): PredictiveManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearPredictiveLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PredictiveManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): PredictiveManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    createModel: (input) => {
      assertRunning("createModel");
      return createPredictionModel(input);
    },
    getModel: getPredictionModel,
    listModels: listPredictionModels,
    predictIncident: (input) => {
      assertRunning("predictIncident");
      return predictIncident(input);
    },
    getIncidentPrediction,
    listIncidentPredictions,
    forecastCapacity: (input) => {
      assertRunning("forecastCapacity");
      return forecastCapacity(input);
    },
    getCapacityForecast,
    listCapacityForecasts,
    detectCustomerRisk: (input) => {
      assertRunning("detectCustomerRisk");
      return detectCustomerRisk(input);
    },
    getCustomerRisk: getCustomerRiskSignal,
    listCustomerRisks: listCustomerRiskSignals,
    scoreRisk: (input) => {
      assertRunning("scoreRisk");
      return scorePredictiveRisk(input);
    },
    getRiskScore,
    listRiskScores,
    evaluateReadiness: (predictionModelId) => {
      assertRunning("evaluateReadiness");
      return evaluatePredictiveReadiness(predictionModelId);
    },
    manifest: getPredictiveRegistryManifest,
  };
}

export { assertPredictiveReadinessReady };
