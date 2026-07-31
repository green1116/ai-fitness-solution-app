/**
 * PI-3.4 — Compose API exposure with PI-3.2 services + PI-3.3 runtime.
 */
import { getCommandOwnership } from "../foundation/command-ownership";
import type { BackendServiceId } from "../foundation/service-catalogue";
import { resolveServiceForAction } from "../services/action-service-routing";
import {
  resolveRuntimeBindingPlan,
  type RuntimeBindingPlan,
} from "../runtime/runtime-plan";
import type { RuntimeAdapterBinding } from "../runtime/runtime-bindings";
import type { RuntimeSurfaceId } from "../runtime/runtime-surfaces";
import {
  API_SURFACE_LAYER_ID,
  type ApiFamilyId,
} from "./api-families";
import {
  getApiSurfaceBinding,
  requiresHttpExposure,
  type ApiBindingKind,
} from "./api-surface-bindings";
import {
  adaptersForApiRoute,
  resolveApiRoute,
  type ResolvedApiRoute,
} from "./api-route-resolve";

export type ApiExposurePlan = Readonly<{
  layerId: typeof API_SURFACE_LAYER_ID;
  actionId: string;
  command: string;
  bindingKind: ApiBindingKind;
  requiresHttp: boolean;
  families: readonly ApiFamilyId[];
  routes: readonly ResolvedApiRoute[];
  primaryRoute: ResolvedApiRoute | null;
  surfaces: readonly RuntimeSurfaceId[];
  serviceId: BackendServiceId;
  runtime: RuntimeBindingPlan;
  /** Adapters implied by preferred HTTP routes (subset of runtime catalogue). */
  routeAdapters: readonly RuntimeAdapterBinding[];
}>;

/**
 * Bind an ACT-* to existing API surface + service + runtime plan.
 * Does not invoke HTTP or Domain modules.
 */
export function resolveApiExposurePlan(actionId: string): ApiExposurePlan {
  const binding = getApiSurfaceBinding(actionId);
  if (!binding) {
    throw new Error(`Unknown API surface binding: ${actionId}`);
  }

  const ownership = getCommandOwnership(actionId);
  if (!ownership) {
    throw new Error(`Unknown command ownership for ${actionId}`);
  }

  const serviceId = resolveServiceForAction(actionId);
  if (!serviceId) {
    throw new Error(`No service routing for ${actionId}`);
  }

  const runtime = resolveRuntimeBindingPlan(actionId);
  const requiresHttp = requiresHttpExposure(binding.bindingKind);
  const routes = requiresHttp
    ? binding.routes.map((route) => resolveApiRoute(route))
    : [];

  const seen = new Set<string>();
  const routeAdapters: RuntimeAdapterBinding[] = [];
  for (const route of binding.routes) {
    for (const adapter of adaptersForApiRoute(route)) {
      if (seen.has(adapter.adapterId)) continue;
      seen.add(adapter.adapterId);
      routeAdapters.push(adapter);
    }
  }

  return {
    layerId: API_SURFACE_LAYER_ID,
    actionId: binding.actionId,
    command: binding.command,
    bindingKind: binding.bindingKind,
    requiresHttp,
    families: binding.families,
    routes,
    primaryRoute: routes[0] ?? null,
    surfaces: binding.surfaces,
    serviceId,
    runtime,
    routeAdapters,
  };
}
