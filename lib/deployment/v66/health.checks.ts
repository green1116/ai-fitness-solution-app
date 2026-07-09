/**
 * V66 P2 — Health check evaluation (declarative, deterministic)
 */
import type {
  DeploymentExecutionSignals,
  HealthCheckManifest,
  HealthCheckResult,
  HealthCheckStatus,
} from "./execution.types";
import { V66_DEPLOYMENT_EXECUTION_VERSION } from "./execution.types";
import { HEALTH_CHECK_INVENTORY } from "./health.inventory";

function signalToStatus(value: boolean | undefined, required: boolean): HealthCheckStatus {
  if (value === true) return "pass";
  if (value === false) return required ? "fail" : "warn";
  return required ? "fail" : "skip";
}

export function evaluateHealthChecks(
  signals: DeploymentExecutionSignals,
): HealthCheckResult[] {
  return HEALTH_CHECK_INVENTORY.map((def) => ({
    id: def.id,
    label: def.label,
    category: def.category,
    severity: def.severity,
    status: signalToStatus(signals[def.signalKey], def.required),
    required: def.required,
    notes: def.notes,
  }));
}

export function buildHealthCheckManifest(
  signals: DeploymentExecutionSignals,
): HealthCheckManifest {
  const checks = evaluateHealthChecks(signals);
  const passCount = checks.filter((c) => c.status === "pass").length;
  const requiredPass = checks
    .filter((c) => c.required)
    .every((c) => c.status === "pass");

  return {
    version: V66_DEPLOYMENT_EXECUTION_VERSION,
    checkCount: checks.length,
    passCount,
    requiredPass,
    checks,
    summary: [
      `health-checks pass=${passCount}/${checks.length}`,
      `requiredPass=${requiredPass}`,
    ].join(" "),
  };
}

export function scoreHealthChecks(manifest: HealthCheckManifest): number {
  if (manifest.requiredPass) return 100;
  return Math.round((manifest.passCount / manifest.checkCount) * 100);
}
