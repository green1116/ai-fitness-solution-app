/**
 * Evolution P2 — Prediction Model
 * Binds evolution intelligence + optional growth / CS / cloud
 */

import { checkRuntimeHealth } from "../../cloud-runtime/e11/runtime/cloud.health";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getCustomerHealthProfile } from "../../operations/customer-success/success.health";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { getOperationsIntelligenceProfile } from "../evolution.intelligence";
import { PREDICTION_HORIZONS } from "./predictive.constants";
import type {
  CreatePredictionModelInput,
  PredictionHorizon,
  PredictionModel,
} from "./predictive.types";

const models = new Map<string, PredictionModel>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneModel(model: PredictionModel): PredictionModel {
  return { ...model, metadata: { ...model.metadata } };
}

export function createPredictionModel(
  input: CreatePredictionModelInput,
): PredictionModel {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const intelligenceProfileId = input.intelligenceProfileId.trim();

  if (!name) throw new Error("predictionModel.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const intel = getOperationsIntelligenceProfile(intelligenceProfileId);
  if (!intel || intel.productId !== productId) {
    throw new Error(
      `operations intelligence profile not found: ${intelligenceProfileId}`,
    );
  }

  if (input.growthDashboardId) {
    const dash = getGrowthDashboard(input.growthDashboardId.trim());
    if (!dash || dash.productId !== productId) {
      throw new Error(
        `growth dashboard not found: ${input.growthDashboardId}`,
      );
    }
  }

  if (input.customerHealthProfileId) {
    const health = getCustomerHealthProfile(
      input.customerHealthProfileId.trim(),
    );
    if (!health || health.productId !== productId) {
      throw new Error(
        `customer health profile not found: ${input.customerHealthProfileId}`,
      );
    }
  }

  if (input.cloudRuntimeId) {
    const report = checkRuntimeHealth(input.cloudRuntimeId.trim());
    if (!report.ok && report.level === "UNKNOWN") {
      throw new Error(`cloud runtime not found: ${input.cloudRuntimeId}`);
    }
  }

  const horizon: PredictionHorizon = input.horizon ?? "SHORT_TERM";
  if (!(PREDICTION_HORIZONS as readonly string[]).includes(horizon)) {
    throw new Error(`invalid prediction horizon: ${horizon}`);
  }

  const confidence = Math.max(
    35,
    Math.min(98, Math.round(intel.intelligenceScore * 0.9 + 8)),
  );

  const id = input.id?.trim() || createId("predmodel");
  if (models.has(id)) {
    throw new Error(`prediction model already exists: ${id}`);
  }

  const now = nowIso();
  const model: PredictionModel = {
    id,
    name,
    productId,
    intelligenceProfileId,
    growthDashboardId: input.growthDashboardId?.trim() || undefined,
    customerHealthProfileId:
      input.customerHealthProfileId?.trim() || undefined,
    cloudRuntimeId: input.cloudRuntimeId?.trim() || undefined,
    horizon,
    confidence,
    detail: `horizon=${horizon} confidence=${confidence} intel=${intel.intelligenceScore}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  models.set(id, model);
  return cloneModel(model);
}

export function getPredictionModel(id: string): PredictionModel | undefined {
  const model = models.get(id.trim());
  return model ? cloneModel(model) : undefined;
}

export function listPredictionModels(filter?: {
  productId?: string;
  intelligenceProfileId?: string;
}): PredictionModel[] {
  let result = [...models.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((m) => m.productId === pid);
  }
  if (filter?.intelligenceProfileId) {
    const iid = filter.intelligenceProfileId.trim();
    result = result.filter((m) => m.intelligenceProfileId === iid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneModel);
}

export function clearPredictionModels(): void {
  models.clear();
}
