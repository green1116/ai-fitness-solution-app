/**
 * V67 P8 — Monitoring layer version lock (read-only)
 */
import { V64_COMMERCIAL_FREEZE_VERSION } from "@/lib/commercial/v64/freeze.types";
import { V65_PRODUCTION_SIGNOFF_VERSION } from "@/lib/production/v65/signoff.types";
import {
  V66_DEPLOYMENT_FREEZE_VERSION,
  V66_DEPLOYMENT_SIGNOFF_VERSION,
} from "@/lib/deployment/v66/signoff.types";

import { V67_ALERT_TAXONOMY_VERSION } from "../alerting/taxonomy.types";
import { V67_MONITORING_FOUNDATION_VERSION } from "../foundation.types";
import { V67_INCIDENT_LIFECYCLE_VERSION } from "../incident/lifecycle.types";
import { V67_OBSERVABILITY_DASHBOARD_VERSION } from "../observability/governance.types";
import { V67_ONCALL_GOVERNANCE_VERSION } from "../oncall/governance.types";
import { V67_POSTMORTEM_FOUNDATION_VERSION } from "../postmortem/governance.types";
import { V67_SLO_GOVERNANCE_VERSION } from "../slo/governance.types";

import type { MonitoringLayerVersionLock } from "./signoff.types";
import {
  V67_MONITORING_FREEZE_VERSION,
  V67_MONITORING_SIGNOFF_VERSION,
} from "./signoff.types";

export const V67_MONITORING_LAYER_VERSION_LOCK: MonitoringLayerVersionLock = {
  foundation: V67_MONITORING_FOUNDATION_VERSION,
  incidentLifecycle: V67_INCIDENT_LIFECYCLE_VERSION,
  alertTaxonomy: V67_ALERT_TAXONOMY_VERSION,
  sloGovernance: V67_SLO_GOVERNANCE_VERSION,
  oncallGovernance: V67_ONCALL_GOVERNANCE_VERSION,
  observabilityDashboard: V67_OBSERVABILITY_DASHBOARD_VERSION,
  postmortemFoundation: V67_POSTMORTEM_FOUNDATION_VERSION,
  signoff: V67_MONITORING_SIGNOFF_VERSION,
  freeze: V67_MONITORING_FREEZE_VERSION,
  upstreamV66DeploymentSignoff: V66_DEPLOYMENT_SIGNOFF_VERSION,
  upstreamV66DeploymentFreeze: V66_DEPLOYMENT_FREEZE_VERSION,
  upstreamV65ProductionSignoff: V65_PRODUCTION_SIGNOFF_VERSION,
  upstreamV64CommercialFreeze: V64_COMMERCIAL_FREEZE_VERSION,
};

export const EXPECTED_MONITORING_LAYER_VERSIONS: MonitoringLayerVersionLock =
  V67_MONITORING_LAYER_VERSION_LOCK;

export function isMonitoringLayerVersionLockIntact(): boolean {
  const lock = V67_MONITORING_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function monitoringVersionLockMatchesExpected(): boolean {
  const lock = V67_MONITORING_LAYER_VERSION_LOCK;
  const expected = EXPECTED_MONITORING_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof MonitoringLayerVersionLock>).every(
    (key) => lock[key] === expected[key],
  );
}
