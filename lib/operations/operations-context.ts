/**
 * V4-A1 — cached V3.7 release foundation for operations aggregation
 */

import {
  buildV37ProductionReleaseFoundation,
  type V37ProductionReleaseFoundation,
} from "../release/index";

let cachedRelease: V37ProductionReleaseFoundation | undefined;
let cachedDeploymentId: string | undefined;

export function getReleaseFoundationForOperations(
  deploymentId = "v4-production-operations",
): V37ProductionReleaseFoundation {
  if (cachedRelease && cachedDeploymentId === deploymentId) {
    return cachedRelease;
  }
  cachedRelease = buildV37ProductionReleaseFoundation({ deploymentId });
  cachedDeploymentId = deploymentId;
  return cachedRelease;
}

export function resetOperationsReleaseCache(): void {
  cachedRelease = undefined;
  cachedDeploymentId = undefined;
}

export function warmOperationsReleaseContext(deploymentId: string): void {
  console.log(`  warming V3.7 release context for operations (${deploymentId})...`);
  const started = Date.now();
  getReleaseFoundationForOperations(deploymentId);
  console.log(`  release context ready in ${Date.now() - started}ms`);
}
