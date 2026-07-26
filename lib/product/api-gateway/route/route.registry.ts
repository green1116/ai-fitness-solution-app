/**
 * Product API Gateway — route registry + resolution
 */

import { GATEWAY_HTTP_METHODS } from "../management/management.constants";
import { getGateway } from "../registry/gateway.registry";
import type {
  GatewayHttpMethod,
  GatewayRoute,
  GatewayRouteResolution,
  RegisterGatewayRouteInput,
  ResolveGatewayRouteInput,
} from "./route.types";

const routes = new Map<string, GatewayRoute>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.replace(/\/+$/, "") || "/";
}

function cloneRoute(route: GatewayRoute): GatewayRoute {
  return { ...route, metadata: { ...route.metadata } };
}

export function registerGatewayRoute(
  input: RegisterGatewayRouteInput,
): GatewayRoute {
  const gatewayId = input.gatewayId.trim();
  const routeKey = input.routeKey.trim().toUpperCase();
  const apiKeyRef = input.apiKeyRef.trim().toUpperCase();
  const path = normalizePath(input.path);
  if (!gatewayId) throw new Error("route.gatewayId is required");
  if (!routeKey) throw new Error("route.routeKey is required");
  if (!apiKeyRef) throw new Error("route.apiKeyRef is required");
  if (!(GATEWAY_HTTP_METHODS as readonly string[]).includes(input.method)) {
    throw new Error(`invalid route method: ${input.method}`);
  }

  const gateway = getGateway(gatewayId);
  if (!gateway) throw new Error(`gateway not found: ${gatewayId}`);
  if (gateway.status !== "ACTIVE") {
    throw new Error(`gateway not active: ${gatewayId}`);
  }

  const duplicateKey = [...routes.values()].find(
    (r) => r.gatewayId === gatewayId && r.routeKey === routeKey,
  );
  if (duplicateKey) {
    throw new Error(`routeKey already exists: ${routeKey}`);
  }

  const duplicatePath = [...routes.values()].find(
    (r) =>
      r.gatewayId === gatewayId &&
      r.method === input.method &&
      r.path === path,
  );
  if (duplicatePath) {
    throw new Error(`route already mapped: ${input.method} ${path}`);
  }

  const id = input.id?.trim() || createId("apigwroute");
  if (routes.has(id)) throw new Error(`route already exists: ${id}`);

  const route: GatewayRoute = {
    id,
    gatewayId,
    routeKey,
    method: input.method,
    path,
    apiKeyRef,
    detail: `${input.method} ${path}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  routes.set(id, route);
  return cloneRoute(route);
}

export function resolveGatewayRoute(
  input: ResolveGatewayRouteInput,
): GatewayRouteResolution {
  const gatewayId = input.gatewayId.trim();
  const path = normalizePath(input.path);
  if (!gatewayId) throw new Error("resolve.gatewayId is required");
  if (!(GATEWAY_HTTP_METHODS as readonly string[]).includes(input.method)) {
    throw new Error(`invalid resolve method: ${input.method}`);
  }

  const gateway = getGateway(gatewayId);
  if (!gateway || gateway.status !== "ACTIVE") {
    return { resolved: false, detail: `gateway unavailable: ${gatewayId}` };
  }

  const match = [...routes.values()].find(
    (r) =>
      r.gatewayId === gatewayId &&
      r.method === input.method &&
      r.path === path,
  );
  if (!match) {
    return {
      resolved: false,
      detail: `unresolved: ${input.method} ${path}`,
    };
  }
  return {
    resolved: true,
    route: cloneRoute(match),
    detail: `resolved=${match.routeKey}`,
  };
}

export function getGatewayRoute(id: string): GatewayRoute | undefined {
  const route = routes.get(id.trim());
  return route ? cloneRoute(route) : undefined;
}

export function listGatewayRoutes(filter?: {
  gatewayId?: string;
  method?: GatewayHttpMethod;
}): GatewayRoute[] {
  let result = [...routes.values()];
  if (filter?.gatewayId) {
    const gatewayId = filter.gatewayId.trim();
    result = result.filter((r) => r.gatewayId === gatewayId);
  }
  if (filter?.method) {
    result = result.filter((r) => r.method === filter.method);
  }
  return result
    .slice()
    .sort((a, b) => a.routeKey.localeCompare(b.routeKey))
    .map(cloneRoute);
}

export function clearGatewayRoutes(): void {
  routes.clear();
}
