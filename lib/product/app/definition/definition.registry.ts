/**
 * Product App — definition registry
 */

import { getApp } from "../registry/app.registry";
import type {
  AppDefinition,
  RegisterAppDefinitionInput,
} from "./definition.types";

const definitions = new Map<string, AppDefinition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDefinition(definition: AppDefinition): AppDefinition {
  return { ...definition, metadata: { ...definition.metadata } };
}

export function registerAppDefinition(
  input: RegisterAppDefinitionInput,
): AppDefinition {
  const appId = input.appId.trim();
  const definitionKey = input.definitionKey.trim().toUpperCase();
  const summary = input.summary.trim();
  const capabilityRef = input.capabilityRef.trim().toUpperCase();
  if (!appId) throw new Error("definition.appId is required");
  if (!definitionKey) throw new Error("definition.definitionKey is required");
  if (!summary) throw new Error("definition.summary is required");
  if (!capabilityRef) throw new Error("definition.capabilityRef is required");

  const app = getApp(appId);
  if (!app) throw new Error(`app not found: ${appId}`);
  if (app.status === "RETIRED") {
    throw new Error(`app retired: ${appId}`);
  }

  const duplicate = [...definitions.values()].find(
    (d) => d.appId === appId && d.definitionKey === definitionKey,
  );
  if (duplicate) {
    throw new Error(`definitionKey already exists: ${definitionKey}`);
  }

  const id = input.id?.trim() || createId("appdef");
  if (definitions.has(id)) throw new Error(`definition already exists: ${id}`);

  const definition: AppDefinition = {
    id,
    appId,
    definitionKey,
    summary,
    capabilityRef,
    detail: `capability=${capabilityRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  definitions.set(id, definition);
  return cloneDefinition(definition);
}

export function getAppDefinition(id: string): AppDefinition | undefined {
  const definition = definitions.get(id.trim());
  return definition ? cloneDefinition(definition) : undefined;
}

export function listAppDefinitions(filter?: {
  appId?: string;
}): AppDefinition[] {
  let result = [...definitions.values()];
  if (filter?.appId) {
    const appId = filter.appId.trim();
    result = result.filter((d) => d.appId === appId);
  }
  return result
    .slice()
    .sort((a, b) => a.definitionKey.localeCompare(b.definitionKey))
    .map(cloneDefinition);
}

export function clearAppDefinitions(): void {
  definitions.clear();
}
