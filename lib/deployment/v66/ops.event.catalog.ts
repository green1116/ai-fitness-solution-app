/**
 * V66 P3 — Ops event catalog (declarative inventory)
 */
import type { OpsEventDefinition, OpsEventManifest } from "./observability.types";
import { V66_DEPLOYMENT_OBSERVABILITY_VERSION } from "./observability.types";

export const OPS_EVENT_CATALOG: OpsEventDefinition[] = [
  {
    id: "OPS-EVT-001",
    name: "deployment_baseline_ready",
    category: "deploy",
    severity: "info",
    source: "lib/deployment/v66/baseline.entry.ts",
    description: "P1 deployment baseline report ready",
  },
  {
    id: "OPS-EVT-002",
    name: "deployment_execution_ready",
    category: "health",
    severity: "info",
    source: "lib/deployment/v66/execution.entry.ts",
    description: "P2 health checks and startup verification complete",
  },
  {
    id: "OPS-EVT-003",
    name: "env_contract_validated",
    category: "config",
    severity: "info",
    source: "lib/deployment/v66/env.contract.ts",
    description: "Env contract manifest built",
  },
  {
    id: "OPS-EVT-004",
    name: "health_check_evaluated",
    category: "health",
    severity: "info",
    source: "lib/deployment/v66/health.checks.ts",
    description: "Health check manifest evaluated",
  },
  {
    id: "OPS-EVT-005",
    name: "startup_sequence_verified",
    category: "deploy",
    severity: "info",
    source: "lib/deployment/v66/startup.verification.ts",
    description: "Startup verification sequence complete",
  },
  {
    id: "OPS-EVT-006",
    name: "readiness_probe_declared",
    category: "health",
    severity: "info",
    source: "lib/deployment/v66/probe.surface.ts",
    description: "Readiness probe surface catalog present",
  },
  {
    id: "OPS-EVT-007",
    name: "verify_chain_passed",
    category: "verify",
    severity: "info",
    source: "npm run verify:v66-deployment",
    description: "V66 deployment verify chain passed",
  },
  {
    id: "OPS-EVT-008",
    name: "upstream_production_frozen",
    category: "upstream",
    severity: "info",
    source: "lib/deployment/v66/baseline.lock.ts",
    description: "V48–V65 frozen layer references intact",
  },
  {
    id: "OPS-EVT-009",
    name: "structured_log_emitted",
    category: "observability",
    severity: "info",
    source: "lib/deployment/v66/deployment.log.formatter.ts",
    description: "Structured deployment log entry formatted",
  },
  {
    id: "OPS-EVT-010",
    name: "platform_health_observed",
    category: "upstream",
    severity: "info",
    source: "lib/portal/v60/observability/platform-events.ts",
    description: "Reference to frozen V60 platform event model",
  },
  {
    id: "OPS-EVT-011",
    name: "observability_baseline_ready",
    category: "observability",
    severity: "info",
    source: "lib/deployment/v66/observability.entry.ts",
    description: "P3 observability baseline report ready",
  },
  {
    id: "OPS-EVT-012",
    name: "deployment_verify_failed",
    category: "verify",
    severity: "error",
    source: "scripts/verify-v66-p3-deployment-observability.ts",
    description: "V66 P3 observability verify failed",
  },
];

export function buildOpsEventManifest(): OpsEventManifest {
  const events = OPS_EVENT_CATALOG;
  const categories = new Set(events.map((e) => e.category));
  const catalogComplete = events.length >= 10 && categories.size >= 5;

  return {
    version: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
    eventCount: events.length,
    categoryCount: categories.size,
    catalogComplete,
    events,
    summary: [
      `ops-events count=${events.length}`,
      `categories=${categories.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getOpsEventsByCategory(
  category: OpsEventDefinition["category"],
): OpsEventDefinition[] {
  return OPS_EVENT_CATALOG.filter((e) => e.category === category);
}
