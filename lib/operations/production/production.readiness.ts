/**
 * Post-Launch P1 — Operations Readiness
 * Integrates launch control plane, cloud health, observability, SLA support
 */

import { aggregateObservabilityHealth } from "../../cloud-runtime/e11/observability/observability.health";
import { aggregateCloudHealth } from "../../cloud-runtime/e11/runtime/cloud.health";
import { getLaunchOrchestration } from "../../launch/control/control.orchestration";
import { computeLaunchMetrics } from "../../launch/control/control.metrics";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
} from "../../launch/signoff/governance.freeze.lock";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { listOperationChecklists } from "./production.checklist";
import { OPERATIONS_PRODUCTION_FOUNDATION_BASE } from "./production.constants";
import { computeProductionMetrics } from "./production.metrics";
import {
  getProductionOperation,
  setProductionOperationStatus,
} from "./production.operation";
import type {
  OperationsReadinessCheck,
  OperationsReadinessResult,
} from "./production.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): OperationsReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateOperationsReadiness(
  productionOperationId: string,
): OperationsReadinessResult {
  const operation = getProductionOperation(productionOperationId.trim());
  if (!operation) {
    return {
      productionOperationId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "OPS-OPERATION",
          "operation",
          "Production operation exists",
          false,
          `operation not found: ${productionOperationId}`,
        ),
      ],
      summary: "operations readiness not ready: operation missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: OperationsReadinessCheck[] = [];

  checks.push(
    check(
      "OPS-LAUNCH-BASE",
      "launch",
      "Launch complete baseline aligned",
      OPERATIONS_PRODUCTION_FOUNDATION_BASE ===
        ENTERPRISE_LAUNCH_COMPLETE_ID &&
        LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
          "enterprise-launch-commercial-release-complete-v1",
      `base=${OPERATIONS_PRODUCTION_FOUNDATION_BASE} complete=${LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID}`,
    ),
  );

  if (operation.orchestrationId) {
    const orch = getLaunchOrchestration(operation.orchestrationId);
    let metricsOk = false;
    let metricsDetail = "orchestration missing";
    if (orch) {
      try {
        const metrics = computeLaunchMetrics(orch.id);
        metricsOk = metrics.readinessScore >= 0;
        metricsDetail = `orch=${orch.id} status=${orch.status} score=${metrics.readinessScore}`;
      } catch (error) {
        metricsDetail =
          error instanceof Error ? error.message : "metrics failed";
      }
    }
    checks.push(
      check(
        "OPS-CONTROL",
        "control",
        "Launch control plane orchestration bound",
        orch !== undefined && metricsOk,
        metricsDetail,
      ),
    );
  } else {
    checks.push(
      check(
        "OPS-CONTROL",
        "control",
        "Launch control plane orchestration bound",
        false,
        "orchestration not bound",
      ),
    );
  }

  const cloud = aggregateCloudHealth();
  checks.push(
    check(
      "OPS-CLOUD",
      "cloud",
      "Cloud runtime health HEALTHY",
      cloud.ok && cloud.level === "HEALTHY",
      `level=${cloud.level} healthy=${cloud.healthyCount}`,
    ),
  );

  const observability = aggregateObservabilityHealth();
  checks.push(
    check(
      "OPS-OBS",
      "observability",
      "Observability health HEALTHY",
      observability.ok && observability.level === "HEALTHY",
      `level=${observability.level} runtimes=${observability.runtimeCount}`,
    ),
  );

  if (operation.supportSlaProfileId) {
    const support = getSupportSlaProfile(operation.supportSlaProfileId);
    checks.push(
      check(
        "OPS-SLA",
        "sla",
        "SLA support profile ACTIVE",
        support !== undefined && support.status === "ACTIVE",
        support
          ? `sla=${support.id} status=${support.status}`
          : `missing=${operation.supportSlaProfileId}`,
      ),
    );
  } else {
    checks.push(
      check(
        "OPS-SLA",
        "sla",
        "SLA support profile bound",
        false,
        "support sla profile not bound",
      ),
    );
  }

  const checklists = listOperationChecklists({
    productionOperationId: operation.id,
  });
  const checklistOk =
    checklists.length >= 1 && checklists.every((c) => c.complete);
  checks.push(
    check(
      "OPS-CHECKLIST",
      "checklist",
      "Operation checklist complete",
      checklistOk,
      `checklists=${checklists.length} complete=${checklistOk}`,
    ),
  );

  const metrics = computeProductionMetrics(operation.id);
  checks.push(
    check(
      "OPS-METRICS",
      "metrics",
      "Production metrics readiness score >= 70",
      metrics.readinessScore >= 70,
      `score=${metrics.readinessScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  if (verdict === "READY" && operation.status !== "ACTIVE") {
    setProductionOperationStatus(operation.id, "ACTIVE");
  } else if (verdict === "BLOCKED" && operation.status === "ACTIVE") {
    setProductionOperationStatus(operation.id, "DEGRADED");
  }

  return {
    productionOperationId: operation.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: [
      `operations-readiness verdict=${verdict}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
    evaluatedAt: nowIso(),
  };
}

export function assertOperationsReadinessReady(
  result: OperationsReadinessResult,
): asserts result is OperationsReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`operations not ready: ${result.summary}`);
  }
}
