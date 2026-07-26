/**
 * Product API — Registry
 */

import { API_KINDS } from "../management/management.constants";
import type { ApiKind, ProductApi, RegisterApiInput } from "./api.types";

const apis = new Map<string, ProductApi>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneApi(api: ProductApi): ProductApi {
  return { ...api, metadata: { ...api.metadata } };
}

export function registerApi(input: RegisterApiInput): ProductApi {
  const apiKey = input.apiKey.trim().toUpperCase();
  const name = input.name.trim();
  if (!apiKey) throw new Error("api.apiKey is required");
  if (!name) throw new Error("api.name is required");
  if (!(API_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid api kind: ${input.kind}`);
  }
  if (keys.has(apiKey)) throw new Error(`apiKey already exists: ${apiKey}`);

  const id = input.id?.trim() || createId("api");
  if (apis.has(id)) throw new Error(`api already exists: ${id}`);

  const api: ProductApi = {
    id,
    apiKey,
    name,
    kind: input.kind,
    detail: `key=${apiKey} kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  apis.set(id, api);
  keys.set(apiKey, id);
  return cloneApi(api);
}

export function getApi(id: string): ProductApi | undefined {
  const api = apis.get(id.trim());
  return api ? cloneApi(api) : undefined;
}

export function getApiByKey(apiKey: string): ProductApi | undefined {
  const id = keys.get(apiKey.trim().toUpperCase());
  return id ? getApi(id) : undefined;
}

export function listApis(filter?: { kind?: ApiKind }): ProductApi[] {
  let result = [...apis.values()];
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.apiKey.localeCompare(b.apiKey))
    .map(cloneApi);
}

export function clearApis(): void {
  apis.clear();
  keys.clear();
}
