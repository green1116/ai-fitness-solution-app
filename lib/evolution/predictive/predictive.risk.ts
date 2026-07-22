/**
 * Evolution P2 — Risk Scoring
 * Aggregates incident / capacity / customer / growth signals
 */

import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { RISK_BANDS } from "./predictive.constants";
import { getCapacityForecast } from "./predictive.capacity";
import { getCustomerRiskSignal } from "./predictive.customer";
import { getIncidentPrediction } from "./predictive.incident";
import { getPredictionModel } from "./predictive.model";
import type {
  RiskBand,
  RiskScore,
  ScoreRiskInput,
} from "./predictive.types";

const scores = new Map<string, RiskScore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScore(score: RiskScore): RiskScore {
  return { ...score };
}

function bandFromScore(score: number): RiskBand {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MODERATE";
  if (score > 0) return "LOW";
  return "UNKNOWN";
}

export function scorePredictiveRisk(input: ScoreRiskInput): RiskScore {
  const model = getPredictionModel(input.predictionModelId.trim());
  if (!model) {
    throw new Error(
      `prediction model not found: ${input.predictionModelId}`,
    );
  }

  let incidentComponent = 40;
  if (input.incidentPredictionId) {
    const pred = getIncidentPrediction(input.incidentPredictionId.trim());
    if (!pred || pred.predictionModelId !== model.id) {
      throw new Error(
        `incident prediction not found: ${input.incidentPredictionId}`,
      );
    }
    incidentComponent = pred.probability;
  }

  let capacityComponent = 40;
  if (input.capacityForecastId) {
    const forecast = getCapacityForecast(input.capacityForecastId.trim());
    if (!forecast || forecast.predictionModelId !== model.id) {
      throw new Error(
        `capacity forecast not found: ${input.capacityForecastId}`,
      );
    }
    capacityComponent = forecast.projectedUtilization;
  }

  let customerComponent = 35;
  if (input.customerRiskSignalId) {
    const signal = getCustomerRiskSignal(input.customerRiskSignalId.trim());
    if (!signal || signal.predictionModelId !== model.id) {
      throw new Error(
        `customer risk signal not found: ${input.customerRiskSignalId}`,
      );
    }
    customerComponent = signal.riskScore;
  }

  let growthComponent = 40;
  if (model.growthDashboardId) {
    const dash = getGrowthDashboard(model.growthDashboardId);
    growthComponent =
      dash != null ? Math.max(0, 100 - dash.growthScore) : 40;
  }

  const score = Math.round(
    incidentComponent * 0.35 +
      capacityComponent * 0.25 +
      customerComponent * 0.25 +
      growthComponent * 0.15,
  );
  const band = bandFromScore(score);
  if (!(RISK_BANDS as readonly string[]).includes(band)) {
    throw new Error(`invalid risk band: ${band}`);
  }

  const id = input.id?.trim() || createId("riskscore");
  if (scores.has(id)) {
    throw new Error(`risk score already exists: ${id}`);
  }

  const risk: RiskScore = {
    id,
    predictionModelId: model.id,
    band,
    score,
    incidentComponent,
    capacityComponent,
    customerComponent,
    growthComponent,
    detail: `band=${band} score=${score}`,
    scoredAt: nowIso(),
  };
  scores.set(id, risk);
  return cloneScore(risk);
}

export function getRiskScore(id: string): RiskScore | undefined {
  const score = scores.get(id.trim());
  return score ? cloneScore(score) : undefined;
}

export function listRiskScores(filter?: {
  predictionModelId?: string;
  band?: RiskBand;
}): RiskScore[] {
  let result = [...scores.values()];
  if (filter?.predictionModelId) {
    const mid = filter.predictionModelId.trim();
    result = result.filter((s) => s.predictionModelId === mid);
  }
  if (filter?.band) result = result.filter((s) => s.band === filter.band);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScore);
}

export function clearRiskScores(): void {
  scores.clear();
}
