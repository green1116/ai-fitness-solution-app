/**
 * E11-P7 — Control Snapshot
 * Captures enterprise control plane posture across integrated layers
 */

import { listOperations } from "../autonomous/autonomous.operation";
import { captureGovernanceMetrics } from "../governance/governance.metrics";
import { captureObservabilityMetrics } from "../observability/observability.metrics";
import { listRuntimes } from "../registry/cloud.registry";
import { listTenants } from "../tenant/tenant.namespace";
import {
  E11_CONTROL_PLANE_ID,
  E11_CONTROL_PLANE_VERSION,
} from "./control-plane.constants";
import { captureComplianceState } from "./control-plane.compliance";
import { listControlPlanes } from "./control-plane.model";
import { listGlobalPolicies } from "./control-plane.policy";
import type { ControlSnapshot } from "./control-plane.types";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function captureControlSnapshot(options?: {
  tenantId?: string;
  metadata?: Record<string, unknown>;
  commandCount?: number;
}): ControlSnapshot {
  const compliance = captureComplianceState({
    tenantId: options?.tenantId,
  });
  const obs = captureObservabilityMetrics();
  const gov = captureGovernanceMetrics();
  const operations = listOperations(
    options?.tenantId ? { tenantId: options.tenantId } : undefined,
  );

  return {
    snapshotId: createId("csnap"),
    planeId: E11_CONTROL_PLANE_ID,
    version: E11_CONTROL_PLANE_VERSION,
    planeCount: listControlPlanes().length,
    policyCount: listGlobalPolicies().length,
    commandCount: options?.commandCount ?? 0,
    runtimeCount: listRuntimes().length,
    tenantCount: listTenants().length,
    compliance: compliance.overall,
    observabilityEvents: obs.eventCount,
    governanceUtilization: gov.averageUtilization,
    autonomousOperations: operations.length,
    metadata: { ...(options?.metadata ?? {}) },
    capturedAt: nowIso(),
  };
}
