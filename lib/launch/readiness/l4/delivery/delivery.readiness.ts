/**
 * Launch L4 — Enterprise delivery validation readiness
 */

import { LAUNCH_L3_PRODUCTION_HARDENING_ID } from "../../l3/runtime/runtime.constants";
import { listArtifactReports } from "../artifact/artifact.report";
import { listDeliveryArtifacts } from "../artifact/artifact.verify";
import { LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE } from "../scenario/scenario.constants";
import { listScenarios } from "../scenario/scenario.registry";
import { listValidationChecks } from "../validation/validation.checks";
import { listValidationResults } from "../validation/validation.result";
import { listWorkflows } from "../workflow/workflow.engine";
import { listWorkflowSteps } from "../workflow/workflow.steps";
import { listDeliveryAcceptances } from "./delivery.acceptance";
import { listDeliveryStatusRecords } from "./delivery.status";
import type { L4ReadinessCheck, L4ReadinessResult } from "./delivery.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): L4ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateL4DeliveryValidationReadiness(): L4ReadinessResult {
  const checks: L4ReadinessCheck[] = [];

  checks.push(
    check(
      "L4-BASE",
      "foundation",
      "L3 production hardening baseline aligned",
      LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE ===
        LAUNCH_L3_PRODUCTION_HARDENING_ID,
      `base=${LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE}`,
    ),
  );

  const scenarios = listScenarios();
  checks.push(
    check(
      "L4-SCN",
      "scenario",
      "Scenarios registered",
      scenarios.length >= 1,
      `scenarios=${scenarios.length}`,
    ),
  );

  const workflows = listWorkflows();
  checks.push(
    check(
      "L4-WF",
      "workflow",
      "Workflows present",
      workflows.length >= 1,
      `workflows=${workflows.length}`,
    ),
  );

  const steps = listWorkflowSteps();
  checks.push(
    check(
      "L4-STP",
      "workflow",
      "Workflow steps present",
      steps.length >= 1,
      `steps=${steps.length}`,
    ),
  );

  const validationChecks = listValidationChecks();
  checks.push(
    check(
      "L4-CHK",
      "validation",
      "Validation checks present",
      validationChecks.length >= 1,
      `checks=${validationChecks.length}`,
    ),
  );

  const validationResults = listValidationResults();
  checks.push(
    check(
      "L4-RES",
      "validation",
      "Validation results present",
      validationResults.length >= 1,
      `results=${validationResults.length}`,
    ),
  );

  const artifacts = listDeliveryArtifacts();
  checks.push(
    check(
      "L4-ART",
      "artifact",
      "Delivery artifacts present",
      artifacts.length >= 1,
      `artifacts=${artifacts.length}`,
    ),
  );

  const reports = listArtifactReports();
  checks.push(
    check(
      "L4-REP",
      "artifact",
      "Artifact reports present",
      reports.length >= 1,
      `reports=${reports.length}`,
    ),
  );

  const acceptances = listDeliveryAcceptances();
  checks.push(
    check(
      "L4-ACC",
      "delivery",
      "Delivery acceptances present",
      acceptances.length >= 1,
      `acceptances=${acceptances.length}`,
    ),
  );

  const statuses = listDeliveryStatusRecords();
  checks.push(
    check(
      "L4-STS",
      "delivery",
      "Delivery statuses present",
      statuses.length >= 1,
      `statuses=${statuses.length}`,
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
    summary: `l4-enterprise-delivery-validation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertL4DeliveryValidationReadinessReady(
  result: L4ReadinessResult,
): asserts result is L4ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `l4 enterprise delivery validation not ready: ${result.summary}`,
    );
  }
}
