/**
 * Product Operations — readiness
 */

import { PRODUCT_SYSTEM_CONFIGURATION_ID } from "../../configuration/management/management.constants";
import { listOpsDispatches } from "../dispatch/dispatch.registry";
import { listOpsIncidents } from "../incident/incident.registry";
import { listOpsPlaybooks } from "../playbook/playbook.registry";
import { listOpsSurfaces } from "../surface/surface.registry";
import { PRODUCT_OPERATIONS_CONSOLE_BASE } from "./console.constants";
import type {
  OperationsReadinessCheck,
  OperationsReadinessResult,
} from "./console.types";

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

export function evaluateOperationsConsoleReadiness(): OperationsReadinessResult {
  const checks: OperationsReadinessCheck[] = [];

  checks.push(
    check(
      "OPS-BASE",
      "console",
      "System configuration aligned",
      PRODUCT_OPERATIONS_CONSOLE_BASE === PRODUCT_SYSTEM_CONFIGURATION_ID,
      `base=${PRODUCT_OPERATIONS_CONSOLE_BASE}`,
    ),
  );

  const surfaces = listOpsSurfaces();
  checks.push(
    check(
      "OPS-SFC",
      "surface",
      "Active console surfaces present",
      surfaces.some((s) => s.status === "ACTIVE"),
      `surfaces=${surfaces.length}`,
    ),
  );

  const incidents = listOpsIncidents();
  checks.push(
    check(
      "OPS-INC",
      "incident",
      "Incidents present",
      incidents.length >= 1,
      `incidents=${incidents.length}`,
    ),
  );

  const playbooks = listOpsPlaybooks();
  checks.push(
    check(
      "OPS-PB",
      "playbook",
      "Playbooks present",
      playbooks.length >= 1,
      `playbooks=${playbooks.length}`,
    ),
  );

  const dispatches = listOpsDispatches();
  checks.push(
    check(
      "OPS-DSP",
      "dispatch",
      "Succeeded dispatches present",
      dispatches.some((d) => d.status === "SUCCEEDED"),
      `dispatches=${dispatches.length}`,
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
    summary: `product-operations readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOperationsConsoleReadinessReady(
  result: OperationsReadinessResult,
): asserts result is OperationsReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product operations console not ready: ${result.summary}`,
    );
  }
}
