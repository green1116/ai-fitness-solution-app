/**
 * V66 P8 — Deployment layer version lock (read-only)
 */
import { V64_COMMERCIAL_FREEZE_VERSION } from "@/lib/commercial/v64/freeze.types";
import { V65_PRODUCTION_SIGNOFF_VERSION } from "@/lib/production/v65/signoff.types";

import { V66_DEPLOYMENT_BASELINE_VERSION } from "./baseline.types";
import { V66_DEPLOYMENT_DR_VERSION } from "./dr.types";
import { V66_DEPLOYMENT_EXECUTION_VERSION } from "./execution.types";
import { V66_DEPLOYMENT_OBSERVABILITY_VERSION } from "./observability.types";
import { V66_DEPLOYMENT_OPS_VERSION } from "./ops.types";
import { V66_RELEASE_ORCHESTRATION_VERSION } from "./release.types";
import { V66_DEPLOYMENT_SECURITY_VERSION } from "./security.types";
import type { DeploymentLayerVersionLock } from "./signoff.types";
import {
  V66_DEPLOYMENT_FREEZE_VERSION,
  V66_DEPLOYMENT_SIGNOFF_VERSION,
} from "./signoff.types";

export const V66_DEPLOYMENT_LAYER_VERSION_LOCK: DeploymentLayerVersionLock = {
  baseline: V66_DEPLOYMENT_BASELINE_VERSION,
  execution: V66_DEPLOYMENT_EXECUTION_VERSION,
  observability: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
  releaseOrchestration: V66_RELEASE_ORCHESTRATION_VERSION,
  security: V66_DEPLOYMENT_SECURITY_VERSION,
  dr: V66_DEPLOYMENT_DR_VERSION,
  ops: V66_DEPLOYMENT_OPS_VERSION,
  signoff: V66_DEPLOYMENT_SIGNOFF_VERSION,
  freeze: V66_DEPLOYMENT_FREEZE_VERSION,
  upstreamV65Signoff: V65_PRODUCTION_SIGNOFF_VERSION,
  upstreamV64Commercial: V64_COMMERCIAL_FREEZE_VERSION,
};

export const EXPECTED_DEPLOYMENT_LAYER_VERSIONS: DeploymentLayerVersionLock =
  V66_DEPLOYMENT_LAYER_VERSION_LOCK;

export function isDeploymentLayerVersionLockIntact(): boolean {
  const lock = V66_DEPLOYMENT_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function deploymentVersionLockMatchesExpected(): boolean {
  const lock = V66_DEPLOYMENT_LAYER_VERSION_LOCK;
  const expected = EXPECTED_DEPLOYMENT_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof DeploymentLayerVersionLock>).every(
    (key) => lock[key] === expected[key],
  );
}
