/**
 * V66 P3 — Structured deployment log event inventory (declarative)
 */
import type { DeploymentLogEventDefinition } from "./observability.types";

export const DEPLOYMENT_LOG_EVENT_INVENTORY: DeploymentLogEventDefinition[] = [
  {
    id: "DEP-LOG-001",
    phase: "baseline",
    level: "info",
    message: "deployment_baseline_verified",
    required: true,
  },
  {
    id: "DEP-LOG-002",
    phase: "baseline",
    level: "info",
    message: "env_contract_loaded",
    required: true,
  },
  {
    id: "DEP-LOG-003",
    phase: "execution",
    level: "info",
    message: "health_check_passed",
    required: true,
  },
  {
    id: "DEP-LOG-004",
    phase: "execution",
    level: "info",
    message: "startup_verification_complete",
    required: true,
  },
  {
    id: "DEP-LOG-005",
    phase: "health",
    level: "info",
    message: "readiness_probe_surface_registered",
    required: true,
  },
  {
    id: "DEP-LOG-006",
    phase: "verify",
    level: "info",
    message: "deployment_verify_passed",
    required: true,
  },
  {
    id: "DEP-LOG-007",
    phase: "observability",
    level: "info",
    message: "ops_event_catalog_loaded",
    required: true,
  },
  {
    id: "DEP-LOG-008",
    phase: "observability",
    level: "info",
    message: "observability_surface_declared",
    required: true,
  },
  {
    id: "DEP-LOG-009",
    phase: "deploy",
    level: "warn",
    message: "optional_probe_skipped",
    required: false,
  },
  {
    id: "DEP-LOG-010",
    phase: "health",
    level: "error",
    message: "health_check_failed",
    required: true,
  },
];

export const DEPLOYMENT_LOG_SCHEMA_FIELDS = [
  "schemaVersion",
  "timestamp",
  "deploymentId",
  "phase",
  "eventId",
  "level",
  "message",
  "meta",
] as const;
