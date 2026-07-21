/**
 * E11-P1 — Cloud Health / Status Model
 */

import { listContexts } from "./cloud.context";
import {
  E11_CLOUD_RUNTIME_BASE,
  E11_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
} from "../core/cloud.constants";
import { listRuntimes } from "../registry/cloud.registry";
import type {
  CloudHealthLevel,
  CloudHealthReport,
  CloudManagerStatus,
  CloudRuntimeRecord,
  CloudStatusSnapshot,
} from "../types/cloud.types";

function nowIso(): string {
  return new Date().toISOString();
}

function levelForRuntime(runtime: CloudRuntimeRecord): CloudHealthLevel {
  switch (runtime.status) {
    case "ACTIVE":
      return "HEALTHY";
    case "REGISTERED":
    case "SUSPENDED":
      return "DEGRADED";
    case "STOPPED":
      return "UNHEALTHY";
    default:
      return "UNKNOWN";
  }
}

export function checkRuntimeHealth(runtimeId: string): CloudHealthReport {
  const list = listRuntimes();
  const runtime = list.find((r) => r.id === runtimeId.trim());
  if (!runtime) {
    return {
      runtimeId: runtimeId.trim(),
      level: "UNKNOWN",
      ok: false,
      status: "STOPPED",
      checks: ["runtime not found"],
      checkedAt: nowIso(),
    };
  }

  const level = levelForRuntime(runtime);
  const checks: string[] = [
    `status=${runtime.status}`,
    `kind=${runtime.kind}`,
    `version=${runtime.version}`,
  ];
  if (runtime.region) checks.push(`region=${runtime.region}`);
  if (level === "HEALTHY") checks.push("runtime active");

  return {
    runtimeId: runtime.id,
    level,
    ok: level === "HEALTHY",
    status: runtime.status,
    checks,
    checkedAt: nowIso(),
  };
}

export function checkAllRuntimeHealth(): CloudHealthReport[] {
  return listRuntimes()
    .map((r) => checkRuntimeHealth(r.id))
    .sort((a, b) => a.runtimeId.localeCompare(b.runtimeId));
}

export function aggregateCloudHealth(reports?: CloudHealthReport[]): {
  level: CloudHealthLevel;
  ok: boolean;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
} {
  const list = reports ?? checkAllRuntimeHealth();
  let healthyCount = 0;
  let degradedCount = 0;
  let unhealthyCount = 0;

  for (const r of list) {
    if (r.level === "HEALTHY") healthyCount += 1;
    else if (r.level === "DEGRADED") degradedCount += 1;
    else if (r.level === "UNHEALTHY") unhealthyCount += 1;
  }

  let level: CloudHealthLevel = "UNKNOWN";
  if (list.length === 0) level = "UNKNOWN";
  else if (unhealthyCount > 0) level = "UNHEALTHY";
  else if (degradedCount > 0) level = "DEGRADED";
  else level = "HEALTHY";

  return {
    level,
    ok: level === "HEALTHY",
    healthyCount,
    degradedCount,
    unhealthyCount,
  };
}

export function captureCloudStatusSnapshot(
  managerStatus: CloudManagerStatus,
): CloudStatusSnapshot {
  const runtimes = listRuntimes();
  const health = aggregateCloudHealth();
  return {
    cloudId: E11_CLOUD_RUNTIME_ID,
    version: E11_CLOUD_RUNTIME_VERSION,
    freezeVersion: E11_CLOUD_RUNTIME_FREEZE_VERSION,
    base: E11_CLOUD_RUNTIME_BASE,
    managerStatus,
    runtimeCount: runtimes.length,
    activeCount: runtimes.filter((r) => r.status === "ACTIVE").length,
    contextCount: listContexts().length,
    health,
    snappedAt: nowIso(),
  };
}
