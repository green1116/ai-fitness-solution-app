/**
 * E10-P7 — OS Health Aggregation
 */

import { listComponents } from "./os.registry";
import type {
  OsComponent,
  OsComponentHealth,
  OsHealthLevel,
  OsHealthReport,
} from "./os.types";

function nowIso(): string {
  return new Date().toISOString();
}

function levelForComponent(component: OsComponent): OsHealthLevel {
  switch (component.status) {
    case "RUNNING":
      return "HEALTHY";
    case "STARTING":
    case "STOPPING":
    case "REGISTERED":
      return "DEGRADED";
    case "FAILED":
      return "UNHEALTHY";
    case "STOPPED":
      return "UNKNOWN";
    default:
      return "UNKNOWN";
  }
}

export function checkComponentHealth(
  component: OsComponent,
): OsComponentHealth {
  const level = levelForComponent(component);
  const checks: string[] = [
    `status=${component.status}`,
    `kind=${component.kind}`,
    `layerId=${component.layerId}`,
    `bootOrder=${component.bootOrder}`,
  ];
  if (component.lastError) checks.push(`error=${component.lastError}`);
  if (component.startedAt) checks.push(`startedAt=${component.startedAt}`);

  return {
    componentId: component.id,
    kind: component.kind,
    level,
    ok: level === "HEALTHY",
    status: component.status,
    checks,
    checkedAt: nowIso(),
  };
}

/** Aggregate health across all registered OS components. */
export function aggregateHealth(): OsHealthReport {
  const components = listComponents().map(checkComponentHealth);
  let healthyCount = 0;
  let degradedCount = 0;
  let unhealthyCount = 0;

  for (const c of components) {
    if (c.level === "HEALTHY") healthyCount += 1;
    else if (c.level === "DEGRADED") degradedCount += 1;
    else if (c.level === "UNHEALTHY") unhealthyCount += 1;
  }

  let level: OsHealthLevel = "UNKNOWN";
  if (components.length === 0) {
    level = "UNKNOWN";
  } else if (unhealthyCount > 0) {
    level = "UNHEALTHY";
  } else if (degradedCount > 0 || healthyCount < components.length) {
    level = "DEGRADED";
  } else {
    level = "HEALTHY";
  }

  return {
    level,
    ok: level === "HEALTHY",
    componentCount: components.length,
    healthyCount,
    degradedCount,
    unhealthyCount,
    components,
    checkedAt: nowIso(),
  };
}
