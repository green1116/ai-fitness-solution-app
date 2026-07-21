/**
 * E10-P6 — Plugin Model (register / enable / disable)
 */

import { PLUGIN_STATUSES } from "./marketplace.constants";
import { getCatalogEntry } from "./marketplace.catalog";
import type {
  PluginDefinition,
  PluginStatus,
  RegisterPluginInput,
} from "./marketplace.types";

const plugins = new Map<string, PluginDefinition>();

function nowIso(): string {
  return new Date().toISOString();
}

function clonePlugin(plugin: PluginDefinition): PluginDefinition {
  return {
    ...plugin,
    metadata: { ...plugin.metadata },
  };
}

export function registerPlugin(input: RegisterPluginInput): PluginDefinition {
  const id = input.id.trim();
  const name = input.name.trim();
  const catalogId = input.catalogId.trim();
  const version = input.version.trim();
  const entryPoint = input.entryPoint.trim();
  if (!id) throw new Error("plugin.id is required");
  if (!name) throw new Error("plugin.name is required");
  if (!catalogId) throw new Error("plugin.catalogId is required");
  if (!version) throw new Error("plugin.version is required");
  if (!entryPoint) throw new Error("plugin.entryPoint is required");

  const catalog = getCatalogEntry(catalogId);
  if (!catalog) {
    throw new Error(`catalog entry not found: ${catalogId}`);
  }
  if (catalog.kind !== "PLUGIN" && catalog.kind !== "BUNDLE") {
    throw new Error(`catalog kind must be PLUGIN or BUNDLE: ${catalog.kind}`);
  }
  if (plugins.has(id)) {
    throw new Error(`plugin already registered: ${id}`);
  }

  const plugin: PluginDefinition = {
    id,
    name,
    catalogId,
    version,
    status: "REGISTERED",
    entryPoint,
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };
  plugins.set(id, plugin);
  return clonePlugin(plugin);
}

export function getPlugin(id: string): PluginDefinition | undefined {
  const plugin = plugins.get(id.trim());
  return plugin ? clonePlugin(plugin) : undefined;
}

export function listPlugins(filter?: {
  status?: PluginStatus;
  catalogId?: string;
}): PluginDefinition[] {
  let result = [...plugins.values()];
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  if (filter?.catalogId) {
    const cid = filter.catalogId.trim();
    result = result.filter((p) => p.catalogId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlugin);
}

export function enablePlugin(id: string): PluginDefinition {
  const plugin = plugins.get(id.trim());
  if (!plugin) throw new Error(`plugin not found: ${id}`);
  if (plugin.status === "REMOVED") {
    throw new Error(`cannot enable removed plugin: ${id}`);
  }
  plugin.status = "ENABLED";
  plugin.enabledAt = nowIso();
  plugins.set(plugin.id, plugin);
  return clonePlugin(plugin);
}

export function disablePlugin(id: string): PluginDefinition {
  const plugin = plugins.get(id.trim());
  if (!plugin) throw new Error(`plugin not found: ${id}`);
  if (plugin.status !== "ENABLED" && plugin.status !== "REGISTERED") {
    throw new Error(
      `disable requires ENABLED or REGISTERED (current=${plugin.status})`,
    );
  }
  plugin.status = "DISABLED";
  plugins.set(plugin.id, plugin);
  return clonePlugin(plugin);
}

export function removePlugin(id: string): boolean {
  const plugin = plugins.get(id.trim());
  if (!plugin) return false;
  plugin.status = "REMOVED";
  plugins.delete(plugin.id);
  return true;
}

export function clearPlugins(): void {
  plugins.clear();
}

export { PLUGIN_STATUSES };
