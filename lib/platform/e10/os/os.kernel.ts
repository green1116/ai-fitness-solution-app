/**
 * E10-P7 — OS Kernel Lifecycle
 * IDLE → BOOTING → READY → RUNNING → STOPPING → STOPPED
 */

import { E10_OS_ID, E10_OS_VERSION } from "./os.constants";
import { listComponents } from "./os.registry";
import type { OsKernelSnapshot, OsKernelStatus } from "./os.types";

let kernelId = "e10-os-kernel";
let status: OsKernelStatus = "IDLE";
let bootedAt: string | undefined;
let stoppedAt: string | undefined;

function nowIso(): string {
  return new Date().toISOString();
}

export function resetKernel(id?: string): OsKernelSnapshot {
  kernelId = id?.trim() || "e10-os-kernel";
  status = "IDLE";
  bootedAt = undefined;
  stoppedAt = undefined;
  return getKernelSnapshot();
}

export function getKernelSnapshot(): OsKernelSnapshot {
  const components = listComponents();
  return {
    kernelId,
    status,
    osId: E10_OS_ID,
    version: E10_OS_VERSION,
    componentCount: components.length,
    runningCount: components.filter((c) => c.status === "RUNNING").length,
    bootedAt,
    stoppedAt,
  };
}

export function getKernelStatus(): OsKernelStatus {
  return status;
}

export function beginBoot(): OsKernelSnapshot {
  if (status !== "IDLE" && status !== "STOPPED" && status !== "READY") {
    throw new Error(
      `beginBoot requires IDLE|STOPPED|READY (current=${status})`,
    );
  }
  status = "BOOTING";
  stoppedAt = undefined;
  return getKernelSnapshot();
}

export function markReady(): OsKernelSnapshot {
  if (status !== "BOOTING") {
    throw new Error(`markReady requires BOOTING (current=${status})`);
  }
  status = "READY";
  return getKernelSnapshot();
}

export function markRunning(): OsKernelSnapshot {
  if (status !== "READY" && status !== "BOOTING") {
    throw new Error(`markRunning requires READY|BOOTING (current=${status})`);
  }
  status = "RUNNING";
  bootedAt = nowIso();
  return getKernelSnapshot();
}

export function beginShutdown(): OsKernelSnapshot {
  if (status !== "RUNNING" && status !== "READY") {
    throw new Error(
      `beginShutdown requires RUNNING|READY (current=${status})`,
    );
  }
  status = "STOPPING";
  return getKernelSnapshot();
}

export function markStopped(): OsKernelSnapshot {
  if (status !== "STOPPING" && status !== "RUNNING") {
    throw new Error(
      `markStopped requires STOPPING|RUNNING (current=${status})`,
    );
  }
  status = "STOPPED";
  stoppedAt = nowIso();
  return getKernelSnapshot();
}
