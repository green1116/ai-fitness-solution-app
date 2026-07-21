/**
 * E10-P2 — Runtime Service Registry
 */

import { getModule } from "../core/platform.registry";
import {
  E10_RUNTIME_BASE,
  E10_RUNTIME_FREEZE_VERSION,
  E10_RUNTIME_ID,
  E10_RUNTIME_VERSION,
  RUNTIME_SERVICE_KINDS,
} from "./runtime.constants";
import {
  assertServiceStatus,
  transitionService,
} from "./runtime.service";
import type {
  RegisterRuntimeServiceInput,
  RuntimeRegistryManifest,
  RuntimeService,
  RuntimeServiceKind,
  RuntimeServiceStatus,
} from "./runtime.types";

const services = new Map<string, RuntimeService>();

function cloneService(service: RuntimeService): RuntimeService {
  return {
    ...service,
    metadata: { ...service.metadata },
  };
}

function assertKind(kind: string): asserts kind is RuntimeServiceKind {
  if (!(RUNTIME_SERVICE_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid runtime service kind: ${kind}`);
  }
}

export function registerService(
  input: RegisterRuntimeServiceInput,
): RuntimeService {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("service.id is required");
  if (!name) throw new Error("service.name is required");
  assertKind(input.kind);

  if (services.has(id)) {
    throw new Error(`runtime service already registered: ${id}`);
  }

  const moduleId = input.moduleId?.trim();
  if (moduleId && !getModule(moduleId)) {
    throw new Error(`platform module not found: ${moduleId}`);
  }

  const created: RuntimeService = {
    id,
    name,
    kind: input.kind,
    status: "CREATED",
    version: (input.version ?? E10_RUNTIME_VERSION).trim(),
    moduleId: moduleId || undefined,
    metadata: { ...(input.metadata ?? {}) },
  };

  const registered = transitionService(
    created,
    "REGISTERED",
    "registered in runtime registry",
  );
  services.set(id, registered);
  return cloneService(registered);
}

export function getService(id: string): RuntimeService | undefined {
  const service = services.get(id.trim());
  return service ? cloneService(service) : undefined;
}

export function listServices(filter?: {
  kind?: RuntimeServiceKind;
  status?: RuntimeServiceStatus;
  moduleId?: string;
}): RuntimeService[] {
  let result = [...services.values()];
  if (filter?.kind) {
    result = result.filter((s) => s.kind === filter.kind);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  if (filter?.moduleId) {
    const moduleId = filter.moduleId.trim();
    result = result.filter((s) => s.moduleId === moduleId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneService);
}

export function removeService(id: string): boolean {
  const service = services.get(id.trim());
  if (!service) return false;
  if (service.status === "RUNNING" || service.status === "STARTING") {
    throw new Error(`cannot remove service while ${service.status}: ${id}`);
  }
  return services.delete(service.id);
}

/** Persist an updated service snapshot (used by manager). */
export function putService(service: RuntimeService): RuntimeService {
  assertServiceStatus(service.status);
  if (!services.has(service.id)) {
    throw new Error(`runtime service not found: ${service.id}`);
  }
  services.set(service.id, {
    ...service,
    metadata: { ...service.metadata },
  });
  return cloneService(service);
}

export function buildRuntimeRegistryManifest(): RuntimeRegistryManifest {
  const list = listServices();
  return {
    runtimeId: E10_RUNTIME_ID,
    version: E10_RUNTIME_VERSION,
    freezeVersion: E10_RUNTIME_FREEZE_VERSION,
    base: E10_RUNTIME_BASE,
    serviceCount: list.length,
    services: list,
  };
}

export function clearServices(): void {
  services.clear();
}
