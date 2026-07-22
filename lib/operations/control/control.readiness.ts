/**
 * Post-Launch P7 — Operations Control Plane Readiness
 */

import { OPERATIONS_ENTERPRISE_SUPPORT_ID } from "../support/support.constants";
import {
  listCommandCenterSnapshots,
} from "./control.command";
import { OPERATIONS_CONTROL_PLANE_BASE } from "./control.constants";
import { listExecutiveOpsDashboards } from "./control.dashboard";
import { listOperationalDecisions } from "./control.decision";
import { aggregateOperationsHealth } from "./control.health";
import { getOperationsOrchestration } from "./control.orchestration";
import type {
  OpsControlReadinessCheck,
  OpsControlReadinessResult,
} from "./control.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): OpsControlReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateOpsControlReadiness(
  orchestrationId: string,
): OpsControlReadinessResult {
  const orchestration = getOperationsOrchestration(orchestrationId.trim());
  if (!orchestration) {
    return {
      orchestrationId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "OC-ORCH",
          "orchestration",
          "Operations orchestration exists",
          false,
          `orchestration not found: ${orchestrationId}`,
        ),
      ],
      summary: "ops control readiness not ready: orchestration missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: OpsControlReadinessCheck[] = [];

  checks.push(
    check(
      "OC-BASE",
      "operations",
      "P6 enterprise support baseline aligned",
      OPERATIONS_CONTROL_PLANE_BASE === OPERATIONS_ENTERPRISE_SUPPORT_ID,
      `base=${OPERATIONS_CONTROL_PLANE_BASE}`,
    ),
  );

  const requiredDomains = [
    "PRODUCTION",
    "CUSTOMER_SUCCESS",
    "INCIDENT",
    "RELEASE",
    "GROWTH",
    "SUPPORT",
  ] as const;
  const presentDomains = orchestration.domains.filter((d) => d.present);
  checks.push(
    check(
      "OC-DOMAINS",
      "orchestration",
      "All ops domains bound",
      requiredDomains.every((d) =>
        presentDomains.some((p) => p.domain === d && !!p.refId),
      ),
      `bound=${presentDomains.map((d) => d.domain).join(",")}`,
    ),
  );

  checks.push(
    check(
      "OC-STATUS",
      "orchestration",
      "Orchestration active",
      orchestration.status === "ACTIVE" ||
        orchestration.status === "DEGRADED",
      `status=${orchestration.status}`,
    ),
  );

  const health = aggregateOperationsHealth(orchestration.id);
  checks.push(
    check(
      "OC-HEALTH",
      "health",
      "Aggregated health computed",
      health.domains.length === 6 && health.overallScore >= 0,
      `overall=${health.overallScore} level=${health.overallLevel}`,
    ),
  );

  const commands = listCommandCenterSnapshots({
    orchestrationId: orchestration.id,
  });
  checks.push(
    check(
      "OC-COMMAND",
      "command",
      "Command center snapshot present",
      commands.length >= 1,
      `snapshots=${commands.length}`,
    ),
  );

  const decisions = listOperationalDecisions({
    orchestrationId: orchestration.id,
  });
  checks.push(
    check(
      "OC-DECISION",
      "decision",
      "Operational decision recorded",
      decisions.length >= 1,
      `decisions=${decisions.length} latest=${decisions[0]?.verdict ?? "none"}`,
    ),
  );

  const dashboards = listExecutiveOpsDashboards({
    orchestrationId: orchestration.id,
  });
  checks.push(
    check(
      "OC-DASHBOARD",
      "dashboard",
      "Executive dashboard present",
      dashboards.length >= 1 && dashboards[0]!.executiveScore >= 40,
      `dashboards=${dashboards.length} score=${dashboards[0]?.executiveScore ?? 0}`,
    ),
  );

  checks.push(
    check(
      "OC-INTEGRATION",
      "integration",
      "Core domain refs present",
      !!orchestration.productionOperationId &&
        !!orchestration.customerHealthProfileId &&
        !!orchestration.operationsIncidentId &&
        !!orchestration.operationsReleaseId &&
        !!orchestration.growthDashboardId &&
        !!orchestration.supportCaseId,
      "production/cs/incident/release/growth/support",
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    orchestrationId: orchestration.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `ops control readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOpsControlReadinessReady(
  result: OpsControlReadinessResult,
): asserts result is OpsControlReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`operations control plane not ready: ${result.summary}`);
  }
}
