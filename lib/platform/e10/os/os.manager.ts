/**
 * E10-P7 — Platform OS Manager
 * Kernel + registry + orchestrator + health + status snapshot
 */

import {
  E10_OS_BASE,
  E10_OS_FREEZE_VERSION,
  E10_OS_ID,
  E10_OS_VERSION,
} from "./os.constants";
import { aggregateHealth } from "./os.health";
import {
  getKernelSnapshot,
  getKernelStatus,
  resetKernel,
} from "./os.kernel";
import {
  bootPlatform,
  ensureDefaultComponents,
  getBootOrder,
  listOrderedComponents,
  shutdownPlatform,
  type LayerHandles,
} from "./os.orchestrator";
import {
  buildOsRegistryManifest,
  clearComponents,
  getComponent,
  getComponentByKind,
  listComponents,
  registerComponent,
  removeComponent,
} from "./os.registry";
import type {
  BootResult,
  OsComponent,
  OsManagerStatus,
  OsPlatformStatusSnapshot,
  RegisterOsComponentInput,
  ShutdownResult,
} from "./os.types";

export type OsManagerSnapshot = {
  managerId: string;
  status: OsManagerStatus;
  layerId: typeof E10_OS_ID;
  version: typeof E10_OS_VERSION;
  kernelStatus: ReturnType<typeof getKernelStatus>;
  componentCount: number;
  runningCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type OsManager = {
  initialize: () => OsManagerSnapshot;
  start: () => OsManagerSnapshot;
  stop: () => OsManagerSnapshot;
  status: () => OsManagerSnapshot;
  registerComponent: (input: RegisterOsComponentInput) => OsComponent;
  getComponent: typeof getComponent;
  getComponentByKind: typeof getComponentByKind;
  listComponents: typeof listComponents;
  removeComponent: (id: string) => boolean;
  boot: () => BootResult;
  shutdown: () => ShutdownResult;
  health: typeof aggregateHealth;
  snapshot: () => OsPlatformStatusSnapshot;
  getBootOrder: typeof getBootOrder;
  getHandles: () => Readonly<LayerHandles>;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createOsManager(options?: {
  managerId?: string;
}): OsManager {
  const managerId =
    options?.managerId?.trim() || createId("e10-os-mgr");
  let state: OsManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;
  const handles: LayerHandles = {};

  function snapshot(): OsManagerSnapshot {
    const kernel = getKernelSnapshot();
    return {
      managerId,
      status: state,
      layerId: E10_OS_ID,
      version: E10_OS_VERSION,
      kernelStatus: kernel.status,
      componentCount: kernel.componentCount,
      runningCount: kernel.runningCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): OsManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    // Stop any leftover layer handles
    if (getKernelStatus() === "RUNNING" || getKernelStatus() === "READY") {
      try {
        shutdownPlatform(handles);
      } catch {
        // ignore during reset
      }
    }
    clearComponents();
    resetKernel(`${managerId}-kernel`);
    ensureDefaultComponents();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): OsManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }
    if (state === "STOPPED") {
      clearComponents();
      resetKernel(`${managerId}-kernel`);
      ensureDefaultComponents();
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): OsManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    const ks = getKernelStatus();
    if (ks === "RUNNING" || ks === "READY" || ks === "BOOTING") {
      shutdownPlatform(handles);
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
    registerComponent: (input) => {
      assertRunning("registerComponent");
      return registerComponent(input);
    },
    getComponent,
    getComponentByKind,
    listComponents,
    removeComponent: (id) => {
      assertRunning("removeComponent");
      return removeComponent(id);
    },
    boot: () => {
      assertRunning("boot");
      return bootPlatform(handles);
    },
    shutdown: () => {
      assertRunning("shutdown");
      return shutdownPlatform(handles);
    },
    health: aggregateHealth,
    snapshot: () => {
      const health = aggregateHealth();
      return {
        osId: E10_OS_ID,
        version: E10_OS_VERSION,
        freezeVersion: E10_OS_FREEZE_VERSION,
        base: E10_OS_BASE,
        managerStatus: state,
        kernelStatus: getKernelStatus(),
        health,
        components: listOrderedComponents(),
        bootOrder: getBootOrder(),
        snappedAt: nowIso(),
      };
    },
    getBootOrder,
    getHandles: () => ({ ...handles }),
  };
}

export function getOsRegistryManifest() {
  return buildOsRegistryManifest();
}
