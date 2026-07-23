/**
 * Operations O4 — Forecast model
 */

import { FORECAST_HORIZONS } from "../growth/growth.constants";
import type {
  ForecastHorizon,
  ForecastModel,
  RegisterForecastModelInput,
} from "./forecast.types";

const models = new Map<string, ForecastModel>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneModel(model: ForecastModel): ForecastModel {
  return { ...model, metadata: { ...model.metadata } };
}

export function registerForecastModel(
  input: RegisterForecastModelInput,
): ForecastModel {
  const name = input.name.trim();
  if (!name) throw new Error("forecast.name is required");
  if (!(FORECAST_HORIZONS as readonly string[]).includes(input.horizon)) {
    throw new Error(`invalid forecast horizon: ${input.horizon}`);
  }
  if (!Number.isFinite(input.baselineValue) || input.baselineValue < 0) {
    throw new Error("forecast.baselineValue must be a non-negative number");
  }
  if (!Number.isFinite(input.growthRate)) {
    throw new Error("forecast.growthRate must be a number");
  }

  const id = input.id?.trim() || createId("o4fmod");
  if (models.has(id)) {
    throw new Error(`forecast model already exists: ${id}`);
  }

  const baselineValue = Math.round(input.baselineValue);
  const growthRate = Math.round(input.growthRate * 100) / 100;
  const model: ForecastModel = {
    id,
    name,
    horizon: input.horizon,
    baselineValue,
    growthRate,
    detail: `horizon=${input.horizon} baseline=${baselineValue} rate=${growthRate}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  models.set(id, model);
  return cloneModel(model);
}

export function getForecastModel(id: string): ForecastModel | undefined {
  const model = models.get(id.trim());
  return model ? cloneModel(model) : undefined;
}

export function listForecastModels(filter?: {
  horizon?: ForecastHorizon;
}): ForecastModel[] {
  let result = [...models.values()];
  if (filter?.horizon) {
    result = result.filter((m) => m.horizon === filter.horizon);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneModel);
}

export function clearForecastModels(): void {
  models.clear();
}
