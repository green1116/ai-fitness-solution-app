/**
 * Post-Launch P7 — Command Center
 */

import { listCustomerHealthProfiles } from "../customer-success/success.health";
import { getGrowthDashboard } from "../growth/growth.dashboard";
import { listOperationsIncidents } from "../incident/incident.model";
import { computeProductionMetrics } from "../production/production.metrics";
import { listOperationsReleases } from "../release/release.lifecycle";
import { listEnterpriseSupportCases } from "../support/support.case";
import { COMMAND_CENTER_MODES } from "./control.constants";
import { aggregateOperationsHealth } from "./control.health";
import { getOperationsOrchestration } from "./control.orchestration";
import type {
  BuildCommandCenterInput,
  CommandCenterMode,
  CommandCenterSnapshot,
} from "./control.types";

const snapshots = new Map<string, CommandCenterSnapshot>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSnapshot(
  snapshot: CommandCenterSnapshot,
): CommandCenterSnapshot {
  return { ...snapshot, alerts: [...snapshot.alerts] };
}

function deriveMode(input: {
  overallScore: number;
  openIncidents: number;
  openSupportCases: number;
}): CommandCenterMode {
  if (input.openIncidents > 0 || input.overallScore < 40) return "RESPOND";
  if (input.overallScore < 60 || input.openSupportCases > 2) return "MONITOR";
  if (input.overallScore < 30) return "LOCKDOWN";
  return "STEADY";
}

export function buildCommandCenter(
  input: BuildCommandCenterInput,
): CommandCenterSnapshot {
  const orchestration = getOperationsOrchestration(
    input.orchestrationId.trim(),
  );
  if (!orchestration) {
    throw new Error(
      `operations orchestration not found: ${input.orchestrationId}`,
    );
  }

  const health = aggregateOperationsHealth(orchestration.id);
  const openIncidents = listOperationsIncidents({
    productionOperationId: orchestration.productionOperationId,
  }).filter(
    (i) => i.status !== "RESOLVED" && i.status !== "CLOSED",
  ).length;

  const openSupportCases = listEnterpriseSupportCases({
    productId: orchestration.productId,
  }).filter(
    (c) =>
      c.status === "OPEN" ||
      c.status === "IN_PROGRESS" ||
      c.status === "ESCALATED" ||
      c.status === "WAITING_CUSTOMER",
  ).length;

  const activeReleases = listOperationsReleases({
    productionOperationId: orchestration.productionOperationId,
  }).filter((r) =>
    ["APPROVED", "DEPLOYING", "RELEASED"].includes(r.status),
  ).length;

  const customerAtRisk = listCustomerHealthProfiles({
    productId: orchestration.productId,
  }).filter(
    (h) => h.health === "AT_RISK" || h.health === "CRITICAL",
  ).length;

  let growthScore: number | undefined;
  if (orchestration.growthDashboardId) {
    growthScore = getGrowthDashboard(orchestration.growthDashboardId)
      ?.growthScore;
  }

  let productionScore: number | undefined;
  try {
    productionScore = computeProductionMetrics(
      orchestration.productionOperationId,
    ).readinessScore;
  } catch {
    productionScore = undefined;
  }

  const alerts: string[] = [];
  if (openIncidents > 0) alerts.push(`openIncidents=${openIncidents}`);
  if (openSupportCases > 0) alerts.push(`openSupportCases=${openSupportCases}`);
  if (customerAtRisk > 0) alerts.push(`customerAtRisk=${customerAtRisk}`);
  if (health.degradedDomains.length > 0) {
    alerts.push(`degraded=${health.degradedDomains.join(",")}`);
  }

  const mode = deriveMode({
    overallScore: health.overallScore,
    openIncidents,
    openSupportCases,
  });
  if (!(COMMAND_CENTER_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid command center mode: ${mode}`);
  }

  const id = input.id?.trim() || createId("cmdctr");
  if (snapshots.has(id)) {
    throw new Error(`command center snapshot already exists: ${id}`);
  }

  const snapshot: CommandCenterSnapshot = {
    id,
    orchestrationId: orchestration.id,
    mode,
    openIncidents,
    openSupportCases,
    activeReleases,
    customerAtRisk,
    growthScore,
    productionScore,
    alerts,
    detail: `mode=${mode} overall=${health.overallScore}`,
    snapshotAt: nowIso(),
  };
  snapshots.set(id, snapshot);
  return cloneSnapshot(snapshot);
}

export function getCommandCenterSnapshot(
  id: string,
): CommandCenterSnapshot | undefined {
  const snapshot = snapshots.get(id.trim());
  return snapshot ? cloneSnapshot(snapshot) : undefined;
}

export function listCommandCenterSnapshots(filter?: {
  orchestrationId?: string;
}): CommandCenterSnapshot[] {
  let result = [...snapshots.values()];
  if (filter?.orchestrationId) {
    const oid = filter.orchestrationId.trim();
    result = result.filter((s) => s.orchestrationId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSnapshot);
}

export function clearCommandCenterSnapshots(): void {
  snapshots.clear();
}
