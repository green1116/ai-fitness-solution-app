/**
 * Launch L3 — Production hardening readiness
 */

import { LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID } from "../../l2/pilot/pilot.constants";
import { listAuditEvents } from "../audit/audit.event";
import { listAuditTrails } from "../audit/audit.trail";
import { listMonitoringAlerts } from "../monitoring/monitoring.alert";
import { listMonitoringMetrics } from "../monitoring/monitoring.metric";
import { LAUNCH_L3_PRODUCTION_HARDENING_BASE } from "../runtime/runtime.constants";
import { listRuntimeHealth } from "../runtime/runtime.health";
import { listRuntimes } from "../runtime/runtime.status";
import { listSecurityChecks } from "../security/security.check";
import { listSecurityPolicies } from "../security/security.policy";
import { listBackupRestores } from "./backup.restore";
import { listBackupSnapshots } from "./backup.snapshot";
import type { L3ReadinessCheck, L3ReadinessResult } from "./backup.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): L3ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateL3HardeningReadiness(): L3ReadinessResult {
  const checks: L3ReadinessCheck[] = [];

  checks.push(
    check(
      "L3-BASE",
      "foundation",
      "L2 pilot customer flow baseline aligned",
      LAUNCH_L3_PRODUCTION_HARDENING_BASE === LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
      `base=${LAUNCH_L3_PRODUCTION_HARDENING_BASE}`,
    ),
  );

  const runtimes = listRuntimes();
  checks.push(
    check(
      "L3-RUN",
      "runtime",
      "Runtimes registered",
      runtimes.length >= 1,
      `runtimes=${runtimes.length}`,
    ),
  );

  const health = listRuntimeHealth();
  checks.push(
    check(
      "L3-HLT",
      "runtime",
      "Runtime health assessed",
      health.length >= 1,
      `health=${health.length}`,
    ),
  );

  const policies = listSecurityPolicies();
  checks.push(
    check(
      "L3-POL",
      "security",
      "Security policies defined",
      policies.length >= 1,
      `policies=${policies.length}`,
    ),
  );

  const secChecks = listSecurityChecks();
  checks.push(
    check(
      "L3-SEC",
      "security",
      "Security checks present",
      secChecks.length >= 1,
      `checks=${secChecks.length}`,
    ),
  );

  const metrics = listMonitoringMetrics();
  checks.push(
    check(
      "L3-MET",
      "monitoring",
      "Monitoring metrics present",
      metrics.length >= 1,
      `metrics=${metrics.length}`,
    ),
  );

  const alerts = listMonitoringAlerts();
  checks.push(
    check(
      "L3-ALT",
      "monitoring",
      "Monitoring alerts present",
      alerts.length >= 1,
      `alerts=${alerts.length}`,
    ),
  );

  const events = listAuditEvents();
  checks.push(
    check(
      "L3-AUD",
      "audit",
      "Audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listAuditTrails();
  checks.push(
    check(
      "L3-TRL",
      "audit",
      "Audit trails assembled",
      trails.length >= 1,
      `trails=${trails.length}`,
    ),
  );

  const snapshots = listBackupSnapshots();
  checks.push(
    check(
      "L3-SNP",
      "backup",
      "Backup snapshots present",
      snapshots.length >= 1,
      `snapshots=${snapshots.length}`,
    ),
  );

  const restores = listBackupRestores();
  checks.push(
    check(
      "L3-RST",
      "backup",
      "Backup restores present",
      restores.length >= 1,
      `restores=${restores.length}`,
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
    summary: `l3-production-hardening readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertL3HardeningReadinessReady(
  result: L3ReadinessResult,
): asserts result is L3ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `l3 production hardening not ready: ${result.summary}`,
    );
  }
}
