/**
 * Product Routing — Registry
 */

import { ROUTING_KINDS } from "../management/management.constants";
import type {
  NotificationRoute,
  RegisterRouteInput,
  RoutingKind,
} from "./route.types";

const routes = new Map<string, NotificationRoute>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRoute(route: NotificationRoute): NotificationRoute {
  return { ...route, metadata: { ...route.metadata } };
}

export function registerRoute(input: RegisterRouteInput): NotificationRoute {
  const routingKey = input.routingKey.trim().toUpperCase();
  const name = input.name.trim();
  const preferenceKey = input.preferenceKey.trim().toUpperCase();
  const templateKey = input.templateKey.trim().toUpperCase();
  if (!routingKey) throw new Error("route.routingKey is required");
  if (!name) throw new Error("route.name is required");
  if (!preferenceKey) throw new Error("route.preferenceKey is required");
  if (!templateKey) throw new Error("route.templateKey is required");
  if (!(ROUTING_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid routing kind: ${input.kind}`);
  }
  if (keys.has(routingKey)) {
    throw new Error(`routingKey already exists: ${routingKey}`);
  }

  const id = input.id?.trim() || createId("route");
  if (routes.has(id)) throw new Error(`route already exists: ${id}`);

  const route: NotificationRoute = {
    id,
    routingKey,
    name,
    kind: input.kind,
    preferenceKey,
    templateKey,
    detail: `key=${routingKey} kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  routes.set(id, route);
  keys.set(routingKey, id);
  return cloneRoute(route);
}

export function getRoute(id: string): NotificationRoute | undefined {
  const route = routes.get(id.trim());
  return route ? cloneRoute(route) : undefined;
}

export function getRouteByKey(
  routingKey: string,
): NotificationRoute | undefined {
  const id = keys.get(routingKey.trim().toUpperCase());
  return id ? getRoute(id) : undefined;
}

export function listRoutes(filter?: {
  kind?: RoutingKind;
}): NotificationRoute[] {
  let result = [...routes.values()];
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.routingKey.localeCompare(b.routingKey))
    .map(cloneRoute);
}

export function clearRoutes(): void {
  routes.clear();
  keys.clear();
}
