/**
 * Post-Launch P7 — Executive Operations Dashboard
 */

import {
  buildCommandCenter,
} from "./control.command";
import { decideOperations } from "./control.decision";
import { aggregateOperationsHealth } from "./control.health";
import { getOperationsOrchestration } from "./control.orchestration";
import type {
  BuildExecutiveOpsDashboardInput,
  ExecutiveOpsDashboard,
} from "./control.types";

const dashboards = new Map<string, ExecutiveOpsDashboard>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDashboard(
  dashboard: ExecutiveOpsDashboard,
): ExecutiveOpsDashboard {
  return {
    ...dashboard,
    health: {
      ...dashboard.health,
      domains: dashboard.health.domains.map((d) => ({ ...d })),
      degradedDomains: [...dashboard.health.degradedDomains],
    },
    commandCenter: {
      ...dashboard.commandCenter,
      alerts: [...dashboard.commandCenter.alerts],
    },
    decision: {
      ...dashboard.decision,
      reasons: [...dashboard.decision.reasons],
      recommendedActions: [...dashboard.decision.recommendedActions],
    },
  };
}

export function buildExecutiveOpsDashboard(
  input: BuildExecutiveOpsDashboardInput,
): ExecutiveOpsDashboard {
  const orchestration = getOperationsOrchestration(
    input.orchestrationId.trim(),
  );
  if (!orchestration) {
    throw new Error(
      `operations orchestration not found: ${input.orchestrationId}`,
    );
  }

  const id = input.id?.trim() || createId("execdash");
  if (dashboards.has(id)) {
    throw new Error(`executive ops dashboard already exists: ${id}`);
  }

  const health = aggregateOperationsHealth(orchestration.id);
  const commandCenter = buildCommandCenter({
    id: `${id}.cmd`,
    orchestrationId: orchestration.id,
  });
  const decision = decideOperations({
    id: `${id}.dec`,
    orchestrationId: orchestration.id,
  });

  const executiveScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        health.overallScore * 0.55 +
          (commandCenter.productionScore ?? 50) * 0.2 +
          (commandCenter.growthScore ?? 50) * 0.15 +
          decision.confidence * 0.1,
      ),
    ),
  );

  const dashboard: ExecutiveOpsDashboard = {
    id,
    orchestrationId: orchestration.id,
    productId: orchestration.productId,
    health,
    commandCenter,
    decision,
    executiveScore,
    summary: `score=${executiveScore} health=${health.overallLevel} decision=${decision.verdict} mode=${commandCenter.mode}`,
    builtAt: nowIso(),
  };
  dashboards.set(id, dashboard);
  return cloneDashboard(dashboard);
}

export function getExecutiveOpsDashboard(
  id: string,
): ExecutiveOpsDashboard | undefined {
  const dashboard = dashboards.get(id.trim());
  return dashboard ? cloneDashboard(dashboard) : undefined;
}

export function listExecutiveOpsDashboards(filter?: {
  orchestrationId?: string;
  productId?: string;
}): ExecutiveOpsDashboard[] {
  let result = [...dashboards.values()];
  if (filter?.orchestrationId) {
    const oid = filter.orchestrationId.trim();
    result = result.filter((d) => d.orchestrationId === oid);
  }
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((d) => d.productId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDashboard);
}

export function clearExecutiveOpsDashboards(): void {
  dashboards.clear();
}
