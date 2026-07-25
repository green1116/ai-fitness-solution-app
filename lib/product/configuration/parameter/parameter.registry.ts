/**
 * Product Configuration — Parameter registry
 */

import { CONFIG_PARAMETER_TYPES } from "../management/management.constants";
import { getConfigNamespace } from "../namespace/namespace.registry";
import type {
  ConfigParameter,
  ConfigParameterType,
  SetConfigParameterInput,
} from "./parameter.types";

const parameters = new Map<string, ConfigParameter>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneParameter(parameter: ConfigParameter): ConfigParameter {
  return { ...parameter, metadata: { ...parameter.metadata } };
}

export function setConfigParameter(
  input: SetConfigParameterInput,
): ConfigParameter {
  const namespaceId = input.namespaceId.trim();
  const key = input.key.trim().toUpperCase();
  const value = input.value.trim();
  if (!namespaceId) throw new Error("parameter.namespaceId is required");
  if (!key) throw new Error("parameter.key is required");
  if (!value) throw new Error("parameter.value is required");
  if (!(CONFIG_PARAMETER_TYPES as readonly string[]).includes(input.type)) {
    throw new Error(`invalid parameter type: ${input.type}`);
  }
  if (!getConfigNamespace(namespaceId)) {
    throw new Error(`namespace not found: ${namespaceId}`);
  }

  const existing = [...parameters.values()].find(
    (p) => p.namespaceId === namespaceId && p.key === key,
  );
  const id = input.id?.trim() || existing?.id || createId("cfgprm");
  if (parameters.has(id) && existing && existing.id !== id) {
    throw new Error(`parameter already exists: ${id}`);
  }

  const parameter: ConfigParameter = {
    id,
    namespaceId,
    key,
    type: input.type,
    value,
    detail: `type=${input.type} key=${key}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    setAt: nowIso(),
  };
  parameters.set(id, parameter);
  return cloneParameter(parameter);
}

export function getConfigParameter(id: string): ConfigParameter | undefined {
  const parameter = parameters.get(id.trim());
  return parameter ? cloneParameter(parameter) : undefined;
}

export function listConfigParameters(filter?: {
  namespaceId?: string;
  type?: ConfigParameterType;
}): ConfigParameter[] {
  let result = [...parameters.values()];
  if (filter?.namespaceId) {
    const namespaceId = filter.namespaceId.trim();
    result = result.filter((p) => p.namespaceId === namespaceId);
  }
  if (filter?.type) result = result.filter((p) => p.type === filter.type);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneParameter);
}

export function clearConfigParameters(): void {
  parameters.clear();
}
