/**
 * V3.7 FINAL ? shared enterprise stack snapshot (cached, readonly)
 */

import { buildEnterprisePreservationClosureFoundation } from "../commercialization/preservation-closure/index";
import type { EnterprisePreservationClosureFoundation } from "../commercialization/preservation-closure/index";

let cachedStack: EnterprisePreservationClosureFoundation | undefined;
let cachedDeploymentId: string | undefined;

export function getEnterpriseStackSnapshot(
  deploymentId = "v37-production-freeze",
): EnterprisePreservationClosureFoundation {
  if (cachedStack && cachedDeploymentId === deploymentId) {
    return cachedStack;
  }
  cachedStack = buildEnterprisePreservationClosureFoundation({ deploymentId });
  cachedDeploymentId = deploymentId;
  return cachedStack;
}

export function resetEnterpriseStackSnapshotCache(): void {
  cachedStack = undefined;
  cachedDeploymentId = undefined;
}

export function warmEnterpriseStackSnapshot(deploymentId: string): void {
  console.log(`  warming enterprise stack snapshot (${deploymentId})...`);
  const started = Date.now();
  getEnterpriseStackSnapshot(deploymentId);
  console.log(`  stack snapshot ready in ${Date.now() - started}ms`);
}
