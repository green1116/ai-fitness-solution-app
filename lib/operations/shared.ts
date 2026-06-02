/**
 * V4-A1 Production Operations — shared constants
 */

import { BUILD_FREEZE_MANIFEST } from "../commercialization/stabilization/build-freeze";
import { V37_FINAL_RELEASE_GENERATION } from "../release/shared";

export const V4_OPERATIONS_GENERATION = "V4-A1" as const;
export const V4_OPERATIONS_VERSION = "4-a1-production-operations-1" as const;

export const V4_OPERATION_TIMESTAMP = BUILD_FREEZE_MANIFEST.verifiedAt;

export const V4_OPERATION_DOMAINS = {
  landing: { label: "Enterprise Landing", owner: "platform-ops", stage: "landing" },
  rolloutReadiness: { label: "Rollout Readiness", owner: "deployment-ops", stage: "rollout" },
  rollout: { label: "Launch Checklist", owner: "release-ops", stage: "rollout" },
  goLive: { label: "Go-Live Control", owner: "release-ops", stage: "go-live" },
  launchClosure: { label: "Launch Closure", owner: "release-ops", stage: "closure" },
  archival: { label: "Archival", owner: "archive-ops", stage: "archival" },
  retention: { label: "Retention Review", owner: "archive-ops", stage: "retention" },
  lifecycle: { label: "Lifecycle Continuity", owner: "lifecycle-ops", stage: "lifecycle" },
  preservationClosure: {
    label: "Preservation Closure",
    owner: "preservation-ops",
    stage: "preservation",
  },
  productionFreeze: {
    label: "Production Freeze",
    owner: "release-engineering",
    stage: "freeze",
  },
  releaseBaseline: {
    label: "Release Baseline",
    owner: "release-engineering",
    stage: "baseline",
  },
  integrityLayer: {
    label: "Integrity Layer",
    owner: "trust-ops",
    stage: "integrity",
  },
  snapshotRuntime: {
    label: "Snapshot Runtime",
    owner: "release-engineering",
    stage: "snapshot",
  },
  releaseGovernance: {
    label: "Release Governance",
    owner: "governance-ops",
    stage: "governance",
  },
  productionOperations: {
    label: "Production Operations",
    owner: "platform-ops",
    stage: "operations",
  },
} as const;

export type V4OperationDomainId = keyof typeof V4_OPERATION_DOMAINS;

export function computeOperationsScore(flags: boolean[]): number {
  if (flags.length === 0) return 0;
  return Math.round((flags.filter(Boolean).length / flags.length) * 100);
}

export function operationsSummaryPrefix(deploymentId: string): string {
  return `V4-A1 ops deployment=${deploymentId.slice(0, 8)} generation=${V4_OPERATIONS_GENERATION} baseline=${V37_FINAL_RELEASE_GENERATION}`;
}
