/**
 * E10-P5 — Route Registry
 */

import {
  E10_GATEWAY_BASE,
  E10_GATEWAY_FREEZE_VERSION,
  E10_GATEWAY_ID,
  E10_GATEWAY_VERSION,
  HTTP_METHODS,
  ROUTE_STATUSES,
} from "./gateway.constants";
import type {
  GatewayRegistryManifest,
  HttpMethod,
  PlatformMetadata,
  RegisterRouteInput,
  RouteDefinition,
  RouteHandler,
  RouteStatus,
} from "./gateway.types";

type InternalRoute = RouteDefinition & { handler?: RouteHandler };

const routes = new Map<string, InternalRoute>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneRoute(route: InternalRoute): RouteDefinition {
  return {
    id: route.id,
    path: route.path,
    method: route.method,
    description: route.description,
    status: route.status,
    serviceId: route.serviceId,
    version: route.version,
    metadata: { ...route.metadata },
    registeredAt: route.registeredAt,
  };
}

function assertMethod(method: string): asserts method is HttpMethod {
  if (!(HTTP_METHODS as readonly string[]).includes(method)) {
    throw new Error(`invalid HTTP method: ${method}`);
  }
}

export function registerRoute(input: RegisterRouteInput): RouteDefinition {
  const id = input.id.trim();
  const routePath = input.path.trim();
  const description = input.description.trim();
  if (!id) throw new Error("route.id is required");
  if (!routePath) throw new Error("route.path is required");
  if (!description) throw new Error("route.description is required");
  assertMethod(input.method);

  if (routes.has(id)) {
    throw new Error(`route already registered: ${id}`);
  }

  const route: InternalRoute = {
    id,
    path: routePath,
    method: input.method,
    description,
    status: "ACTIVE",
    serviceId: input.serviceId?.trim() || undefined,
    version: (input.version ?? E10_GATEWAY_VERSION).trim(),
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
    handler: input.handler,
  };
  routes.set(id, route);
  return cloneRoute(route);
}

export function getRoute(id: string): RouteDefinition | undefined {
  const route = routes.get(id.trim());
  return route ? cloneRoute(route) : undefined;
}

export function getRouteInternal(id: string): InternalRoute | undefined {
  return routes.get(id.trim());
}

export function listRoutes(filter?: {
  method?: HttpMethod;
  status?: RouteStatus;
  serviceId?: string;
}): RouteDefinition[] {
  let result = [...routes.values()];
  if (filter?.method) {
    result = result.filter((r) => r.method === filter.method);
  }
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  if (filter?.serviceId) {
    const sid = filter.serviceId.trim();
    result = result.filter((r) => r.serviceId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRoute);
}

export function setRouteStatus(id: string, status: RouteStatus): RouteDefinition {
  const route = routes.get(id.trim());
  if (!route) throw new Error(`route not found: ${id}`);
  if (!(ROUTE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid route status: ${status}`);
  }
  route.status = status;
  routes.set(route.id, route);
  return cloneRoute(route);
}

export function removeRoute(id: string): boolean {
  return routes.delete(id.trim());
}

/** Resolve a route by path + method (first active match). */
export function resolveRoute(
  path: string,
  method: HttpMethod,
): InternalRoute | undefined {
  for (const route of routes.values()) {
    if (route.status === "ACTIVE" && route.path === path && route.method === method) {
      return route;
    }
  }
  return undefined;
}

export function buildGatewayRegistryManifest(
  middlewareCount: number,
): GatewayRegistryManifest {
  const list = listRoutes();
  return {
    gatewayId: E10_GATEWAY_ID,
    version: E10_GATEWAY_VERSION,
    freezeVersion: E10_GATEWAY_FREEZE_VERSION,
    base: E10_GATEWAY_BASE,
    routeCount: list.length,
    middlewareCount,
    routes: list,
  };
}

export function clearRoutes(): void {
  routes.clear();
}
