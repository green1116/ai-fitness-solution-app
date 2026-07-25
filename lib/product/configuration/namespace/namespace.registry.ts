/**
 * Product Configuration — Namespace registry
 */

import {
  CONFIG_NAMESPACE_SCOPES,
  CONFIG_NAMESPACE_STATUSES,
} from "../management/management.constants";
import type {
  ConfigNamespace,
  ConfigNamespaceScope,
  ConfigNamespaceStatus,
  RegisterConfigNamespaceInput,
  UpdateConfigNamespaceStatusInput,
} from "./namespace.types";

const namespaces = new Map<string, ConfigNamespace>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneNamespace(namespace: ConfigNamespace): ConfigNamespace {
  return { ...namespace, metadata: { ...namespace.metadata } };
}

export function registerConfigNamespace(
  input: RegisterConfigNamespaceInput,
): ConfigNamespace {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (!code) throw new Error("namespace.code is required");
  if (!name) throw new Error("namespace.name is required");
  if (!(CONFIG_NAMESPACE_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid namespace scope: ${input.scope}`);
  }

  const duplicate = [...namespaces.values()].find((n) => n.code === code);
  if (duplicate) throw new Error(`namespace code already exists: ${code}`);

  const id = input.id?.trim() || createId("cfgns");
  if (namespaces.has(id)) throw new Error(`namespace already exists: ${id}`);

  const now = nowIso();
  const namespace: ConfigNamespace = {
    id,
    code,
    name,
    scope: input.scope,
    status: CONFIG_NAMESPACE_STATUSES[0],
    detail: `scope=${input.scope} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  namespaces.set(id, namespace);
  return cloneNamespace(namespace);
}

export function updateConfigNamespaceStatus(
  input: UpdateConfigNamespaceStatusInput,
): ConfigNamespace {
  const namespaceId = input.namespaceId.trim();
  if (!namespaceId) throw new Error("namespace.namespaceId is required");
  if (
    !(CONFIG_NAMESPACE_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid namespace status: ${input.status}`);
  }

  const existing = namespaces.get(namespaceId);
  if (!existing) throw new Error(`namespace not found: ${namespaceId}`);

  const updated: ConfigNamespace = {
    ...existing,
    status: input.status,
    detail: `scope=${existing.scope} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  namespaces.set(namespaceId, updated);
  return cloneNamespace(updated);
}

export function getConfigNamespace(id: string): ConfigNamespace | undefined {
  const namespace = namespaces.get(id.trim());
  return namespace ? cloneNamespace(namespace) : undefined;
}

export function listConfigNamespaces(filter?: {
  scope?: ConfigNamespaceScope;
  status?: ConfigNamespaceStatus;
}): ConfigNamespace[] {
  let result = [...namespaces.values()];
  if (filter?.scope) result = result.filter((n) => n.scope === filter.scope);
  if (filter?.status) {
    result = result.filter((n) => n.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneNamespace);
}

export function clearConfigNamespaces(): void {
  namespaces.clear();
}
