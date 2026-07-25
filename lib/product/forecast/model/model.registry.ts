/**
 * Product Forecast — Model registry
 */

import { FORECAST_MODEL_KINDS } from "../trend/trend.constants";
import type {
  ForecastModel,
  ForecastModelKind,
  RegisterModelInput,
} from "./model.types";

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

export function registerModel(input: RegisterModelInput): ForecastModel {
  const code = input.code.trim().toUpperCase();
  const metricId = input.metricId.trim();
  if (!code) throw new Error("model.code is required");
  if (!metricId) throw new Error("model.metricId is required");
  if (!(FORECAST_MODEL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid forecast model kind: ${input.kind}`);
  }

  const duplicate = [...models.values()].find((m) => m.code === code);
  if (duplicate) throw new Error(`model code already exists: ${code}`);

  const id = input.id?.trim() || createId("fcstmd");
  if (models.has(id)) throw new Error(`model already exists: ${id}`);

  const model: ForecastModel = {
    id,
    code,
    kind: input.kind,
    metricId,
    detail: `kind=${input.kind} metric=${metricId}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  models.set(id, model);
  return cloneModel(model);
}

export function getModel(id: string): ForecastModel | undefined {
  const model = models.get(id.trim());
  return model ? cloneModel(model) : undefined;
}

export function listModels(filter?: {
  kind?: ForecastModelKind;
}): ForecastModel[] {
  let result = [...models.values()];
  if (filter?.kind) result = result.filter((m) => m.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneModel);
}

export function clearModels(): void {
  models.clear();
}
