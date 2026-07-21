/**
 * E10-P7 — OS Component Registry
 */

import {
  E10_OS_BASE,
  E10_OS_FREEZE_VERSION,
  E10_OS_ID,
  E10_OS_VERSION,
  OS_BOOT_ORDER,
  OS_COMPONENT_KINDS,
} from "./os.constants";
import type {
  OsComponent,
  OsComponentKind,
  OsComponentStatus,
  OsRegistryManifest,
  RegisterOsComponentInput,
} from "./os.types";

const components = new Map<string, OsComponent>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneComponent(c: OsComponent): OsComponent {
  return {
    ...c,
    metadata: { ...c.metadata },
  };
}

function assertKind(kind: string): asserts kind is OsComponentKind {
  if (!(OS_COMPONENT_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid OS component kind: ${kind}`);
  }
}

function defaultBootOrder(kind: OsComponentKind): number {
  const idx = (OS_BOOT_ORDER as readonly string[]).indexOf(kind);
  return idx >= 0 ? idx + 1 : 99;
}

export function registerComponent(
  input: RegisterOsComponentInput,
): OsComponent {
  const id = input.id.trim();
  const name = input.name.trim();
  const layerId = input.layerId.trim();
  if (!id) throw new Error("component.id is required");
  if (!name) throw new Error("component.name is required");
  if (!layerId) throw new Error("component.layerId is required");
  assertKind(input.kind);

  if (components.has(id)) {
    throw new Error(`component already registered: ${id}`);
  }

  // One component per kind (platform OS wires each layer once)
  for (const existing of components.values()) {
    if (existing.kind === input.kind) {
      throw new Error(`component kind already registered: ${input.kind}`);
    }
  }

  const component: OsComponent = {
    id,
    name,
    kind: input.kind,
    layerId,
    status: "REGISTERED",
    bootOrder: input.bootOrder ?? defaultBootOrder(input.kind),
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };
  components.set(id, component);
  return cloneComponent(component);
}

export function getComponent(id: string): OsComponent | undefined {
  const c = components.get(id.trim());
  return c ? cloneComponent(c) : undefined;
}

export function getComponentByKind(
  kind: OsComponentKind,
): OsComponent | undefined {
  for (const c of components.values()) {
    if (c.kind === kind) return cloneComponent(c);
  }
  return undefined;
}

export function listComponents(filter?: {
  kind?: OsComponentKind;
  status?: OsComponentStatus;
}): OsComponent[] {
  let result = [...components.values()];
  if (filter?.kind) {
    result = result.filter((c) => c.kind === filter.kind);
  }
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bootOrder - b.bootOrder || a.id.localeCompare(b.id))
    .map(cloneComponent);
}

export function setComponentStatus(
  id: string,
  status: OsComponentStatus,
  error?: string,
): OsComponent {
  const c = components.get(id.trim());
  if (!c) throw new Error(`component not found: ${id}`);
  c.status = status;
  if (status === "RUNNING") {
    c.startedAt = nowIso();
    c.lastError = undefined;
  }
  if (status === "STOPPED") {
    c.stoppedAt = nowIso();
  }
  if (status === "FAILED") {
    c.lastError = error ?? "component failed";
  }
  components.set(c.id, c);
  return cloneComponent(c);
}

export function removeComponent(id: string): boolean {
  return components.delete(id.trim());
}

export function buildOsRegistryManifest(): OsRegistryManifest {
  const list = listComponents();
  return {
    osId: E10_OS_ID,
    version: E10_OS_VERSION,
    freezeVersion: E10_OS_FREEZE_VERSION,
    base: E10_OS_BASE,
    componentCount: list.length,
    components: list,
  };
}

export function clearComponents(): void {
  components.clear();
}
