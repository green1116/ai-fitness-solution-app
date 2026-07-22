/**
 * Commercialization P2 — Delivery model
 */

import { DELIVERY_MODELS } from "../tier/tier.constants";
import { getProductPackage } from "../package/package.registry";
import { getDeliveryScope } from "./delivery.scope";
import type {
  DefineDeliveryModelInput,
  DeliveryModelKind,
  DeliveryModelProfile,
} from "./delivery.types";

const models = new Map<string, DeliveryModelProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneModel(model: DeliveryModelProfile): DeliveryModelProfile {
  return { ...model, regions: [...model.regions] };
}

function defaultSla(model: DeliveryModelKind): number {
  const map: Record<DeliveryModelKind, number> = {
    SAAS: 99.9,
    HYBRID: 99.5,
    ON_PREM: 99.0,
  };
  return map[model];
}

export function defineDeliveryModel(
  input: DefineDeliveryModelInput,
): DeliveryModelProfile {
  const name = input.name.trim();
  const packageId = input.packageId.trim();
  const scopeId = input.scopeId.trim();
  if (!name) throw new Error("deliveryModel.name is required");
  if (!(DELIVERY_MODELS as readonly string[]).includes(input.model)) {
    throw new Error(`invalid delivery model: ${input.model}`);
  }

  const pkg = getProductPackage(packageId);
  if (!pkg) throw new Error(`package not found: ${packageId}`);

  const scope = getDeliveryScope(scopeId);
  if (!scope) throw new Error(`delivery scope not found: ${scopeId}`);
  if (scope.packageId !== packageId) {
    throw new Error(
      `delivery scope package mismatch: scope=${scope.packageId} package=${packageId}`,
    );
  }

  const id = input.id?.trim() || createId("dmodel");
  if (models.has(id)) {
    throw new Error(`delivery model already exists: ${id}`);
  }

  const regions = (input.regions ?? ["GLOBAL"])
    .map((r) => r.trim())
    .filter(Boolean);
  const slaTarget = Math.min(
    100,
    Math.max(90, input.slaTarget ?? defaultSla(input.model)),
  );

  const profile: DeliveryModelProfile = {
    id,
    name,
    model: input.model,
    packageId,
    scopeId,
    regions,
    slaTarget,
    detail: `model=${input.model} sla=${slaTarget} regions=${regions.length}`,
    createdAt: nowIso(),
  };
  models.set(id, profile);
  return cloneModel(profile);
}

export function getDeliveryModel(
  id: string,
): DeliveryModelProfile | undefined {
  const model = models.get(id.trim());
  return model ? cloneModel(model) : undefined;
}

export function listDeliveryModels(filter?: {
  packageId?: string;
  model?: DeliveryModelKind;
}): DeliveryModelProfile[] {
  let result = [...models.values()];
  if (filter?.packageId) {
    const pid = filter.packageId.trim();
    result = result.filter((m) => m.packageId === pid);
  }
  if (filter?.model) result = result.filter((m) => m.model === filter.model);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneModel);
}

export function clearDeliveryModels(): void {
  models.clear();
}
