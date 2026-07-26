/**
 * Product API — Definition registry
 */

import { getApi } from "../registry/api.registry";
import type {
  ApiDefinition,
  DefineApiDefinitionInput,
} from "./definition.types";

const definitions = new Map<string, ApiDefinition>();

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDefinition(definition: ApiDefinition): ApiDefinition {
  return { ...definition, metadata: { ...definition.metadata } };
}

export function defineApiDefinition(
  input: DefineApiDefinitionInput,
): ApiDefinition {
  const apiId = input.apiId.trim();
  const path = input.path.trim();
  const method = input.method.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!apiId) throw new Error("definition.apiId is required");
  if (!path.startsWith("/")) throw new Error("definition.path must start with /");
  if (!(METHODS as readonly string[]).includes(method)) {
    throw new Error(`invalid definition method: ${method}`);
  }
  if (!summary) throw new Error("definition.summary is required");
  if (!getApi(apiId)) throw new Error(`api not found: ${apiId}`);

  const duplicate = [...definitions.values()].find(
    (d) => d.apiId === apiId && d.path === path && d.method === method,
  );
  if (duplicate) {
    throw new Error(`definition already exists: ${method} ${path}`);
  }

  const id = input.id?.trim() || createId("apidef");
  if (definitions.has(id)) throw new Error(`definition already exists: ${id}`);

  const definition: ApiDefinition = {
    id,
    apiId,
    path,
    method,
    summary,
    detail: `${method} ${path}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  definitions.set(id, definition);
  return cloneDefinition(definition);
}

export function getApiDefinition(id: string): ApiDefinition | undefined {
  const definition = definitions.get(id.trim());
  return definition ? cloneDefinition(definition) : undefined;
}

export function listApiDefinitions(filter?: {
  apiId?: string;
}): ApiDefinition[] {
  let result = [...definitions.values()];
  if (filter?.apiId) {
    const apiId = filter.apiId.trim();
    result = result.filter((d) => d.apiId === apiId);
  }
  return result
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))
    .map(cloneDefinition);
}

export function clearApiDefinitions(): void {
  definitions.clear();
}
