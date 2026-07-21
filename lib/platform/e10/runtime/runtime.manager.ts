/**
 * E10-P2 — Runtime Manager
 * Manages runtime state + service lifecycle (no event bus / scheduler)
 */

import {
  E10_RUNTIME_ID,
  E10_RUNTIME_VERSION,
  RUNTIME_MANAGER_STATUSES,
} from "./runtime.constants";
import {
  captureMetricsSnapshot,
  checkRuntimeHealth,
  checkServiceHealth,
  summarizeHealth,
} from "./runtime.monitor";
import {
  clearServices,
  getService,
  listServices,
  putService,
  registerService,
  removeService,
} from "./runtime.registry";
import {
  failService,
  startService,
  stopService,
} from "./runtime.service";
import type {
  RegisterRuntimeServiceInput,
  RuntimeHealthReport,
  RuntimeManagerStatus,
  RuntimeMetricsSnapshot,
  RuntimeService,
} from "./runtime.types";

export type RuntimeManagerSnapshot = {
  runtimeId: string;
  status: RuntimeManagerStatus;
  layerId: typeof E10_RUNTIME_ID;
  version: typeof E10_RUNTIME_VERSION;
  serviceCount: number;
  runningCount: number;
  health: ReturnType<typeof summarizeHealth>;
  startedAt?: string;
  stoppedAt?: string;
};

export type RuntimeManager = {
  initialize: () => RuntimeManagerSnapshot;
  start: () => RuntimeManagerSnapshot;
  stop: () => RuntimeManagerSnapshot;
  status: () => RuntimeManagerSnapshot;
  registerService: (input: RegisterRuntimeServiceInput) => RuntimeService;
  startService: (serviceId: string) => RuntimeService;
  stopService: (serviceId: string) => RuntimeService;
  failService: (serviceId: string, reason: string) => RuntimeService;
  removeService: (serviceId: string) => boolean;
  getService: (id: string) => RuntimeService | undefined;
  listServices: typeof listServices;
  checkHealth: () => RuntimeHealthReport[];
  checkServiceHealth: (serviceId: string) => RuntimeHealthReport;
  metrics: () => RuntimeMetricsSnapshot;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function deriveStatus(
  base: RuntimeManagerStatus,
  services: RuntimeService[],
): RuntimeManagerStatus {
  if (base !== "RUNNING") return base;
  if (services.some((s) => s.status === "FAILED")) return "DEGRADED";
  return "RUNNING";
}

export function createRuntimeManager(options?: {
  runtimeId?: string;
}): RuntimeManager {
  const runtimeId =
    options?.runtimeId?.trim() || createId("e10-rt-mgr");
  let state: RuntimeManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): RuntimeManagerSnapshot {
    const services = listServices();
    const status = deriveStatus(state, services);
    return {
      runtimeId,
      status,
      layerId: E10_RUNTIME_ID,
      version: E10_RUNTIME_VERSION,
      serviceCount: services.length,
      runningCount: services.filter((s) => s.status === "RUNNING").length,
      health: summarizeHealth(checkRuntimeHealth()),
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING" && state !== "DEGRADED") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): RuntimeManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearServices();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): RuntimeManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): RuntimeManagerSnapshot {
    if (state !== "RUNNING" && state !== "DEGRADED") {
      throw new Error(
        `stop requires RUNNING or DEGRADED (current=${state})`,
      );
    }

    // Stop all running services
    for (const service of listServices()) {
      if (service.status === "RUNNING" || service.status === "STARTING") {
        try {
          putService(stopService(service));
        } catch {
          putService(failService(service, "forced stop on manager shutdown"));
        }
      }
    }

    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerService: (input) => {
      assertRunning("registerService");
      return registerService(input);
    },
    startService: (serviceId) => {
      assertRunning("startService");
      const service = getService(serviceId);
      if (!service) throw new Error(`runtime service not found: ${serviceId}`);
      const next = startService(service);
      return putService(next);
    },
    stopService: (serviceId) => {
      assertRunning("stopService");
      const service = getService(serviceId);
      if (!service) throw new Error(`runtime service not found: ${serviceId}`);
      const next = stopService(service);
      return putService(next);
    },
    failService: (serviceId, reason) => {
      assertRunning("failService");
      const service = getService(serviceId);
      if (!service) throw new Error(`runtime service not found: ${serviceId}`);
      const next = failService(service, reason);
      const stored = putService(next);
      state = "DEGRADED";
      return stored;
    },
    removeService: (serviceId) => {
      assertRunning("removeService");
      return removeService(serviceId);
    },
    getService,
    listServices,
    checkHealth: () => checkRuntimeHealth(),
    checkServiceHealth: (serviceId) => checkServiceHealth(serviceId),
    metrics: () => {
      const snap = snapshot();
      return captureMetricsSnapshot({
        runtimeId,
        managerStatus: snap.status,
      });
    },
  };
}

export { RUNTIME_MANAGER_STATUSES };
