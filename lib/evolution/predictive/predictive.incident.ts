/**
 * Evolution P2 — Incident Prediction
 * Integrates incident operations + evolution intelligence
 */

import { listOperationsIncidents } from "../../operations/incident/incident.model";
import { getOperationsIntelligenceProfile } from "../evolution.intelligence";
import { INCIDENT_PREDICTION_LEVELS } from "./predictive.constants";
import { getPredictionModel } from "./predictive.model";
import type {
  IncidentPrediction,
  IncidentPredictionLevel,
  PredictIncidentInput,
} from "./predictive.types";

const predictions = new Map<string, IncidentPrediction>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePrediction(
  prediction: IncidentPrediction,
): IncidentPrediction {
  return { ...prediction, drivers: [...prediction.drivers] };
}

function levelFromProbability(probability: number): IncidentPredictionLevel {
  if (probability >= 80) return "IMMINENT";
  if (probability >= 60) return "LIKELY";
  if (probability >= 35) return "ELEVATED";
  if (probability > 0) return "UNLIKELY";
  return "UNKNOWN";
}

export function predictIncident(
  input: PredictIncidentInput,
): IncidentPrediction {
  const model = getPredictionModel(input.predictionModelId.trim());
  if (!model) {
    throw new Error(
      `prediction model not found: ${input.predictionModelId}`,
    );
  }

  const intel = getOperationsIntelligenceProfile(model.intelligenceProfileId);
  const reliability =
    intel?.signals.find((s) => s.kind === "RELIABILITY")?.score ?? 60;

  const productIncidents = listOperationsIncidents({
    productId: model.productId,
  });
  const openIncidents = productIncidents.filter(
    (i) =>
      i.status === "OPEN" ||
      i.status === "ACKNOWLEDGED" ||
      i.status === "ESCALATED" ||
      i.status === "IN_PROGRESS",
  );

  let severityPressure = 0;
  for (const incident of productIncidents) {
    if (incident.severity === "SEV1") severityPressure += 30;
    else if (incident.severity === "SEV2") severityPressure += 18;
    else if (incident.severity === "SEV3") severityPressure += 8;
    else severityPressure += 3;
  }
  severityPressure = Math.min(100, severityPressure);

  const openCount = openIncidents.length;
  let probability = Math.round(
    Math.max(
      5,
      Math.min(
        95,
        100 -
          reliability +
          openCount * 12 +
          severityPressure * 0.35 +
          (100 - model.confidence) * 0.15,
      ),
    ),
  );

  const drivers: string[] = [];
  if (openCount > 0) drivers.push(`open-incidents=${openCount}`);
  if (severityPressure >= 20) drivers.push("severity-pressure");
  if (reliability < 70) drivers.push("low-reliability-signal");
  if (drivers.length === 0) drivers.push("baseline-watch");

  const level = levelFromProbability(probability);
  if (!(INCIDENT_PREDICTION_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`invalid incident prediction level: ${level}`);
  }

  const id = input.id?.trim() || createId("incpred");
  if (predictions.has(id)) {
    throw new Error(`incident prediction already exists: ${id}`);
  }

  const prediction: IncidentPrediction = {
    id,
    predictionModelId: model.id,
    level,
    probability,
    openIncidentCount: openCount,
    recentSeverityPressure: severityPressure,
    drivers,
    detail: `level=${level} probability=${probability} open=${openCount}`,
    predictedAt: nowIso(),
  };
  predictions.set(id, prediction);
  return clonePrediction(prediction);
}

export function getIncidentPrediction(
  id: string,
): IncidentPrediction | undefined {
  const prediction = predictions.get(id.trim());
  return prediction ? clonePrediction(prediction) : undefined;
}

export function listIncidentPredictions(filter?: {
  predictionModelId?: string;
  level?: IncidentPredictionLevel;
}): IncidentPrediction[] {
  let result = [...predictions.values()];
  if (filter?.predictionModelId) {
    const mid = filter.predictionModelId.trim();
    result = result.filter((p) => p.predictionModelId === mid);
  }
  if (filter?.level) result = result.filter((p) => p.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePrediction);
}

export function clearIncidentPredictions(): void {
  predictions.clear();
}
