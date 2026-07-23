/**
 * Operations O4 — Forecast prediction
 */

import { getForecastModel } from "./forecast.model";
import type {
  ForecastPrediction,
  RunForecastPredictionInput,
} from "./forecast.types";

const predictions = new Map<string, ForecastPrediction>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePrediction(
  prediction: ForecastPrediction,
): ForecastPrediction {
  return { ...prediction };
}

export function runForecastPrediction(
  input: RunForecastPredictionInput,
): ForecastPrediction {
  const modelId = input.modelId.trim();
  const accountRef = input.accountRef.trim();
  if (!modelId) throw new Error("prediction.modelId is required");
  if (!accountRef) throw new Error("prediction.accountRef is required");

  const model = getForecastModel(modelId);
  if (!model) {
    throw new Error(`forecast model not found: ${modelId}`);
  }

  const multiplier =
    model.horizon === "30D"
      ? 1
      : model.horizon === "90D"
        ? 3
        : model.horizon === "180D"
          ? 6
          : 12;
  const predictedValue = Math.max(
    0,
    Math.round(model.baselineValue * (1 + (model.growthRate / 100) * multiplier)),
  );
  const confidence = Math.max(
    40,
    Math.min(95, Math.round(80 - Math.abs(model.growthRate))),
  );

  const id = input.id?.trim() || createId("o4fprd");
  if (predictions.has(id)) {
    throw new Error(`forecast prediction already exists: ${id}`);
  }

  const prediction: ForecastPrediction = {
    id,
    modelId: model.id,
    accountRef,
    predictedValue,
    confidence,
    detail: `predicted=${predictedValue} confidence=${confidence}`,
    predictedAt: nowIso(),
  };
  predictions.set(id, prediction);
  return clonePrediction(prediction);
}

export function getForecastPrediction(
  id: string,
): ForecastPrediction | undefined {
  const prediction = predictions.get(id.trim());
  return prediction ? clonePrediction(prediction) : undefined;
}

export function listForecastPredictions(filter?: {
  accountRef?: string;
}): ForecastPrediction[] {
  let result = [...predictions.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((p) => p.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePrediction);
}

export function clearForecastPredictions(): void {
  predictions.clear();
}
