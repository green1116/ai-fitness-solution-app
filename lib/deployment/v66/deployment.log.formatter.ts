/**
 * V66 P3 — Structured deployment log formatter (deterministic, read-only)
 */
import {
  DEPLOYMENT_LOG_EVENT_INVENTORY,
  DEPLOYMENT_LOG_SCHEMA_FIELDS,
} from "./deployment.log.inventory";
import type {
  DeploymentLogManifest,
  StructuredDeploymentLog,
} from "./observability.types";
import { V66_DEPLOYMENT_OBSERVABILITY_VERSION } from "./observability.types";

export function formatStructuredDeploymentLog(input: {
  deploymentId: string;
  eventId: string;
  meta?: Record<string, string | number | boolean>;
  timestamp?: string;
}): StructuredDeploymentLog | null {
  const definition = DEPLOYMENT_LOG_EVENT_INVENTORY.find((e) => e.id === input.eventId);
  if (!definition) return null;

  return {
    schemaVersion: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
    timestamp: input.timestamp ?? new Date(0).toISOString(),
    deploymentId: input.deploymentId,
    phase: definition.phase,
    eventId: definition.id,
    level: definition.level,
    message: definition.message,
    meta: input.meta,
  };
}

export function serializeStructuredDeploymentLog(entry: StructuredDeploymentLog): string {
  return JSON.stringify(entry);
}

export function isStructuredDeploymentLogShape(
  value: Record<string, unknown>,
): boolean {
  return DEPLOYMENT_LOG_SCHEMA_FIELDS.every((field) => field in value);
}

export function buildDeploymentLogManifest(): DeploymentLogManifest {
  const events = DEPLOYMENT_LOG_EVENT_INVENTORY;
  const requiredEventCount = events.filter((e) => e.required).length;
  const schemaComplete =
    events.length >= 8 &&
    requiredEventCount >= 6 &&
    DEPLOYMENT_LOG_SCHEMA_FIELDS.length >= 7;

  return {
    version: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
    schemaVersion: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
    eventCount: events.length,
    requiredEventCount,
    schemaComplete,
    events,
    summary: [
      `deployment-logs events=${events.length}`,
      `required=${requiredEventCount}`,
      `schemaComplete=${schemaComplete}`,
    ].join(" "),
  };
}

export function buildSampleDeploymentLogs(deploymentId: string): StructuredDeploymentLog[] {
  const sampleIds = ["DEP-LOG-001", "DEP-LOG-003", "DEP-LOG-007", "DEP-LOG-008"];
  return sampleIds
    .map((eventId) =>
      formatStructuredDeploymentLog({
        deploymentId,
        eventId,
        timestamp: "1970-01-01T00:00:00.000Z",
        meta: { deterministic: true },
      }),
    )
    .filter((entry): entry is StructuredDeploymentLog => entry !== null);
}
