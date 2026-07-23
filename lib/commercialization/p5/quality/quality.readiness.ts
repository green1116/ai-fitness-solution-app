/**
 * Commercialization P5 — Delivery operations readiness
 */

import { COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID } from "../../p4/onboarding/onboarding.constants";
import { listArtifactTrackingRecords } from "../artifact/artifact.tracking";
import { listDeliveryArtifacts } from "../artifact/artifact.registry";
import { COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE } from "../delivery/delivery.constants";
import { listDeliveryPlans } from "../delivery/delivery.registry";
import { listDeliveryWorkflowEvents } from "../delivery/delivery.workflow";
import { listDeliveryExecutions } from "../execution/execution.runner";
import { listExecutionStatusRecords } from "../execution/execution.status";
import { listProjectLifecycleRecords } from "../project/project.lifecycle";
import { listDeliveryProjects } from "../project/project.registry";
import { listAcceptanceRecords } from "./quality.acceptance";
import { listQualityChecks } from "./quality.checks";
import type {
  DeliveryOpsReadinessCheck,
  DeliveryOpsReadinessResult,
} from "./quality.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): DeliveryOpsReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateDeliveryOpsReadiness(): DeliveryOpsReadinessResult {
  const checks: DeliveryOpsReadinessCheck[] = [];

  checks.push(
    check(
      "COM-P5-BASE",
      "foundation",
      "P4 onboarding foundation baseline aligned",
      COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE ===
        COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
      `base=${COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE}`,
    ),
  );

  const projects = listDeliveryProjects();
  checks.push(
    check(
      "COM-P5-PROJ",
      "project",
      "Delivery projects registered",
      projects.length >= 1,
      `projects=${projects.length}`,
    ),
  );

  const lifecycles = listProjectLifecycleRecords();
  checks.push(
    check(
      "COM-P5-PLIFE",
      "project",
      "Project lifecycle transitions present",
      lifecycles.length >= 1,
      `lifecycles=${lifecycles.length}`,
    ),
  );

  const deliveries = listDeliveryPlans();
  checks.push(
    check(
      "COM-P5-DELIV",
      "delivery",
      "Delivery plans registered",
      deliveries.length >= 1,
      `deliveries=${deliveries.length}`,
    ),
  );

  const workflow = listDeliveryWorkflowEvents();
  checks.push(
    check(
      "COM-P5-WF",
      "delivery",
      "Delivery workflow events present",
      workflow.length >= 1,
      `events=${workflow.length}`,
    ),
  );

  const executions = listDeliveryExecutions();
  checks.push(
    check(
      "COM-P5-EXEC",
      "execution",
      "Executions started",
      executions.length >= 1,
      `executions=${executions.length}`,
    ),
  );

  const statuses = listExecutionStatusRecords();
  checks.push(
    check(
      "COM-P5-ESTAT",
      "execution",
      "Execution status records present",
      statuses.length >= 1,
      `statuses=${statuses.length}`,
    ),
  );

  const artifacts = listDeliveryArtifacts();
  checks.push(
    check(
      "COM-P5-ART",
      "artifact",
      "Artifacts registered",
      artifacts.length >= 1,
      `artifacts=${artifacts.length}`,
    ),
  );

  const tracking = listArtifactTrackingRecords();
  checks.push(
    check(
      "COM-P5-TRACK",
      "artifact",
      "Artifact tracking present",
      tracking.length >= 1,
      `tracking=${tracking.length}`,
    ),
  );

  const quality = listQualityChecks();
  checks.push(
    check(
      "COM-P5-QUAL",
      "quality",
      "Quality checks present",
      quality.length >= 1,
      `checks=${quality.length}`,
    ),
  );

  const acceptance = listAcceptanceRecords();
  checks.push(
    check(
      "COM-P5-ACC",
      "quality",
      "Acceptance records present",
      acceptance.length >= 1,
      `acceptance=${acceptance.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `delivery-ops readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertDeliveryOpsReadinessReady(
  result: DeliveryOpsReadinessResult,
): asserts result is DeliveryOpsReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`delivery-ops foundation not ready: ${result.summary}`);
  }
}
