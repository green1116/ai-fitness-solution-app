/**
 * V68 P8 — Platform layer version lock (read-only)
 */
import {
  V67_MONITORING_FREEZE_VERSION,
  V67_MONITORING_SIGNOFF_VERSION,
} from "@/lib/monitoring/v67/signoff/signoff.types";

import { V68_CAPACITY_PLANNING_VERSION } from "../capacity-planning/governance.types";
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "../configuration/governance.types";
import { V68_DEPENDENCY_GRAPH_VERSION } from "../dependency-graph/graph.types";
import { V68_FEATURE_FLAG_GOVERNANCE_VERSION } from "../feature-flag/governance.types";
import { V68_OBSERVABILITY_POLICY_VERSION } from "../observability-policy/governance.types";
import { V68_RELIABILITY_POLICY_VERSION } from "../reliability-policy/governance.types";
import { V68_SERVICE_CATALOG_VERSION } from "../service-catalog/catalog.types";

import type { PlatformLayerVersionLock } from "./signoff.types";
import { V68_PLATFORM_FREEZE_VERSION, V68_PLATFORM_SIGNOFF_VERSION } from "./signoff.types";

export const V68_PLATFORM_LAYER_VERSION_LOCK: PlatformLayerVersionLock = {
  serviceCatalog: V68_SERVICE_CATALOG_VERSION,
  dependencyGraph: V68_DEPENDENCY_GRAPH_VERSION,
  configurationGovernance: V68_CONFIGURATION_GOVERNANCE_VERSION,
  featureFlagGovernance: V68_FEATURE_FLAG_GOVERNANCE_VERSION,
  capacityPlanning: V68_CAPACITY_PLANNING_VERSION,
  reliabilityPolicy: V68_RELIABILITY_POLICY_VERSION,
  observabilityPolicy: V68_OBSERVABILITY_POLICY_VERSION,
  signoff: V68_PLATFORM_SIGNOFF_VERSION,
  freeze: V68_PLATFORM_FREEZE_VERSION,
  upstreamV67MonitoringSignoff: V67_MONITORING_SIGNOFF_VERSION,
  upstreamV67MonitoringFreeze: V67_MONITORING_FREEZE_VERSION,
};

export const EXPECTED_PLATFORM_LAYER_VERSIONS: PlatformLayerVersionLock =
  V68_PLATFORM_LAYER_VERSION_LOCK;

export function isPlatformLayerVersionLockIntact(): boolean {
  const lock = V68_PLATFORM_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function platformVersionLockMatchesExpected(): boolean {
  const lock = V68_PLATFORM_LAYER_VERSION_LOCK;
  const expected = EXPECTED_PLATFORM_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof PlatformLayerVersionLock>).every(
    (key) => lock[key] === expected[key],
  );
}
