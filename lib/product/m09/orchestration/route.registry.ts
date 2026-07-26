/**
 * Product M09 — AI Orchestration route registry (soft refs only)
 */

import { AI_ORCHESTRATION_ROUTE_KINDS } from "./orchestration.constants";
import { getAiOrchestration } from "./orchestration.registry";
import type {
  AiOrchestrationRoute,
  AiOrchestrationRouteKind,
  RegisterAiOrchestrationRouteInput,
} from "./orchestration.types";
import { getAiOrchestrationVersion } from "./version.registry";

const routes = new Map<string, AiOrchestrationRoute>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRoute(route: AiOrchestrationRoute): AiOrchestrationRoute {
  return { ...route, metadata: { ...route.metadata } };
}

export function registerAiOrchestrationRoute(
  input: RegisterAiOrchestrationRouteInput,
): AiOrchestrationRoute {
  const orchestrationId = input.orchestrationId.trim();
  const versionId = input.versionId.trim();
  const routeKey = input.routeKey.trim().toUpperCase();
  const workflowKeyRef = input.workflowKeyRef.trim().toUpperCase();
  const promptKeyRef = input.promptKeyRef.trim().toUpperCase();
  const modelKeyRef = input.modelKeyRef.trim().toUpperCase();
  if (!orchestrationId) {
    throw new Error("route.orchestrationId is required");
  }
  if (!versionId) throw new Error("route.versionId is required");
  if (!routeKey) throw new Error("route.routeKey is required");
  if (!workflowKeyRef) throw new Error("route.workflowKeyRef is required");
  if (!promptKeyRef) throw new Error("route.promptKeyRef is required");
  if (!modelKeyRef) throw new Error("route.modelKeyRef is required");
  if (!Number.isFinite(input.order) || input.order < 1) {
    throw new Error("route.order must be >= 1");
  }
  if (
    !(AI_ORCHESTRATION_ROUTE_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid route kind: ${input.kind}`);
  }

  const plan = getAiOrchestration(orchestrationId);
  if (!plan) throw new Error(`orchestration not found: ${orchestrationId}`);
  if (plan.status !== "ACTIVE") {
    throw new Error(`orchestration not active: ${orchestrationId}`);
  }

  const version = getAiOrchestrationVersion(versionId);
  if (!version) throw new Error(`version not found: ${versionId}`);
  if (version.orchestrationId !== orchestrationId) {
    throw new Error(`version orchestration mismatch: ${versionId}`);
  }
  if (version.status !== "PUBLISHED") {
    throw new Error(`version not published: ${versionId}`);
  }

  const order = Math.floor(input.order);
  const duplicate = [...routes.values()].find(
    (r) =>
      r.versionId === versionId &&
      (r.routeKey === routeKey || r.order === order),
  );
  if (duplicate) {
    throw new Error(`route key/order already exists: ${routeKey}/${order}`);
  }

  const id = input.id?.trim() || createId("aiorchroute");
  if (routes.has(id)) throw new Error(`route already exists: ${id}`);

  const route: AiOrchestrationRoute = {
    id,
    orchestrationId,
    versionId,
    routeKey,
    kind: input.kind,
    order,
    workflowKeyRef,
    promptKeyRef,
    modelKeyRef,
    detail: `kind=${input.kind} order=${order} workflow=${workflowKeyRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  routes.set(id, route);
  return cloneRoute(route);
}

export function getAiOrchestrationRoute(
  id: string,
): AiOrchestrationRoute | undefined {
  const route = routes.get(id.trim());
  return route ? cloneRoute(route) : undefined;
}

export function listAiOrchestrationRoutes(filter?: {
  orchestrationId?: string;
  versionId?: string;
  kind?: AiOrchestrationRouteKind;
}): AiOrchestrationRoute[] {
  let result = [...routes.values()];
  if (filter?.orchestrationId) {
    const orchestrationId = filter.orchestrationId.trim();
    result = result.filter((r) => r.orchestrationId === orchestrationId);
  }
  if (filter?.versionId) {
    const versionId = filter.versionId.trim();
    result = result.filter((r) => r.versionId === versionId);
  }
  if (filter?.kind) {
    result = result.filter((r) => r.kind === filter.kind);
  }
  return result
    .slice()
    .sort((a, b) => a.order - b.order || a.routeKey.localeCompare(b.routeKey))
    .map(cloneRoute);
}

export function clearAiOrchestrationRoutes(): void {
  routes.clear();
}
