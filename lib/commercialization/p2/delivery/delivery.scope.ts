/**
 * Commercialization P2 — Delivery scope
 */

import { DELIVERY_SCOPES } from "../tier/tier.constants";
import { getProductPackage } from "../package/package.registry";
import type {
  DefineDeliveryScopeInput,
  DeliveryScopeKind,
  DeliveryScopeProfile,
} from "./delivery.types";

const scopes = new Map<string, DeliveryScopeProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScope(scope: DeliveryScopeProfile): DeliveryScopeProfile {
  return { ...scope };
}

function defaultSupportHours(scope: DeliveryScopeKind): number {
  const map: Record<DeliveryScopeKind, number> = {
    SELF_SERVE: 0,
    ASSISTED: 20,
    MANAGED: 40,
    CUSTOM: 80,
  };
  return map[scope];
}

export function defineDeliveryScope(
  input: DefineDeliveryScopeInput,
): DeliveryScopeProfile {
  const name = input.name.trim();
  const packageId = input.packageId.trim();
  if (!name) throw new Error("deliveryScope.name is required");
  if (!(DELIVERY_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid delivery scope: ${input.scope}`);
  }

  const pkg = getProductPackage(packageId);
  if (!pkg) throw new Error(`package not found: ${packageId}`);
  if (pkg.status === "DRAFT") {
    throw new Error(`delivery scope requires composed/published package`);
  }

  const id = input.id?.trim() || createId("dscope");
  if (scopes.has(id)) {
    throw new Error(`delivery scope already exists: ${id}`);
  }

  const supportHours =
    input.supportHours ?? defaultSupportHours(input.scope);
  const onboardingIncluded =
    input.onboardingIncluded ?? input.scope !== "SELF_SERVE";

  const profile: DeliveryScopeProfile = {
    id,
    name,
    scope: input.scope,
    packageId,
    supportHours: Math.max(0, supportHours),
    onboardingIncluded,
    detail: `scope=${input.scope} supportHours=${Math.max(0, supportHours)}`,
    createdAt: nowIso(),
  };
  scopes.set(id, profile);
  return cloneScope(profile);
}

export function getDeliveryScope(
  id: string,
): DeliveryScopeProfile | undefined {
  const scope = scopes.get(id.trim());
  return scope ? cloneScope(scope) : undefined;
}

export function listDeliveryScopes(filter?: {
  packageId?: string;
  scope?: DeliveryScopeKind;
}): DeliveryScopeProfile[] {
  let result = [...scopes.values()];
  if (filter?.packageId) {
    const pid = filter.packageId.trim();
    result = result.filter((s) => s.packageId === pid);
  }
  if (filter?.scope) result = result.filter((s) => s.scope === filter.scope);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScope);
}

export function clearDeliveryScopes(): void {
  scopes.clear();
}
