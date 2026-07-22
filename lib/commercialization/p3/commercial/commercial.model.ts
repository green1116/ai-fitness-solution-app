/**
 * Commercialization P3 — Commercial model
 */

import { COMMERCIAL_MODELS } from "../pricing/pricing.constants";
import type {
  CommercialModelKind,
  CommercialModelProfile,
  DefineCommercialModelInput,
} from "./commercial.types";

const models = new Map<string, CommercialModelProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneModel(
  model: CommercialModelProfile,
): CommercialModelProfile {
  return { ...model };
}

export function defineCommercialModel(
  input: DefineCommercialModelInput,
): CommercialModelProfile {
  const name = input.name.trim();
  if (!name) throw new Error("commercialModel.name is required");
  if (!(COMMERCIAL_MODELS as readonly string[]).includes(input.model)) {
    throw new Error(`invalid commercial model: ${input.model}`);
  }

  const id = input.id?.trim() || createId("cmodel");
  if (models.has(id)) {
    throw new Error(`commercial model already exists: ${id}`);
  }

  const minimumTermMonths = Math.max(1, input.minimumTermMonths ?? 12);
  const profile: CommercialModelProfile = {
    id,
    name,
    model: input.model,
    billingCycleDefault: input.billingCycleDefault ?? "ANNUAL",
    autoRenew: input.autoRenew ?? true,
    minimumTermMonths,
    detail: `model=${input.model} term=${minimumTermMonths}m`,
    createdAt: nowIso(),
  };
  models.set(id, profile);
  return cloneModel(profile);
}

export function getCommercialModel(
  id: string,
): CommercialModelProfile | undefined {
  const model = models.get(id.trim());
  return model ? cloneModel(model) : undefined;
}

export function listCommercialModels(filter?: {
  model?: CommercialModelKind;
}): CommercialModelProfile[] {
  let result = [...models.values()];
  if (filter?.model) result = result.filter((m) => m.model === filter.model);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneModel);
}

export function clearCommercialModels(): void {
  models.clear();
}
