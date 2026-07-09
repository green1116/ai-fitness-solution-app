/**
 * V67 P1 — Monitoring foundation constants & upstream lock (read-only)
 */
import { V64_COMMERCIAL_FREEZE_VERSION } from "@/lib/commercial/v64/freeze.types";
import { V65_PRODUCTION_SIGNOFF_VERSION } from "@/lib/production/v65/signoff.types";
import {
  V66_DEPLOYMENT_FREEZE_VERSION,
  V66_DEPLOYMENT_SIGNOFF_VERSION,
} from "@/lib/deployment/v66/signoff.types";

import type { UpstreamFrozenMonitoringLock } from "./foundation.types";

export const V67_MONITORING_DOMAIN = "monitoring-incident-response" as const;

export const V67_MONITORING_ARTIFACT_ROOT = "lib/monitoring/v67" as const;

export const V67_UPSTREAM_FROZEN_MONITORING_LOCK: UpstreamFrozenMonitoringLock = {
  v66DeploymentSignoff: V66_DEPLOYMENT_SIGNOFF_VERSION,
  v66DeploymentFreeze: V66_DEPLOYMENT_FREEZE_VERSION,
  v65ProductionSignoff: V65_PRODUCTION_SIGNOFF_VERSION,
  v64CommercialFreeze: V64_COMMERCIAL_FREEZE_VERSION,
};

export function isUpstreamFrozenMonitoringLockIntact(): boolean {
  const lock = V67_UPSTREAM_FROZEN_MONITORING_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export const MONITORING_FOUNDATION_CONTRACT_IDS = [
  "alert-contract",
  "event-contract",
  "slo-contract",
  "oncall-contract",
] as const;

export type MonitoringFoundationContractId = (typeof MONITORING_FOUNDATION_CONTRACT_IDS)[number];
