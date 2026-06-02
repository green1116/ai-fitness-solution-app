/**
 * V3.7-H18 Enterprise Rollout Foundation
 */

export {
  DEPLOYMENT_READINESS_VERSION,
  buildDeploymentReadinessConfig,
  type DeploymentReadinessCheck,
  type DeploymentReadinessConfig,
} from "./deployment-readiness";

export {
  ROLLOUT_SUMMARY_VERSION,
  buildRolloutReadinessSummary,
  type RolloutReadinessSummary,
} from "./rollout-summary";

export {
  ROLLOUT_MANIFEST_VERSION,
  ROLLOUT_VERSION,
  buildRolloutManifest,
  type RolloutManifest,
} from "./rollout-manifest";

import { memoFoundation } from "../foundation-memo";
import {
  buildDeploymentReadinessConfig,
  type DeploymentReadinessConfig,
} from "./deployment-readiness";
import { buildRolloutReadinessSummary, type RolloutReadinessSummary } from "./rollout-summary";
import { buildRolloutManifest, ROLLOUT_VERSION, type RolloutManifest } from "./rollout-manifest";

export const PRODUCTION_ENTERPRISE_ROLLOUT_VERSION = ROLLOUT_VERSION;

export type EnterpriseRolloutFoundation = {
  version: typeof PRODUCTION_ENTERPRISE_ROLLOUT_VERSION;
  foundationId: string;
  readiness: DeploymentReadinessConfig;
  summary: RolloutReadinessSummary;
  manifest: RolloutManifest;
  foundationSummary: string;
};

export function buildEnterpriseRolloutFoundation(input?: {
  deploymentId?: string;
}): EnterpriseRolloutFoundation {
  const deploymentId = input?.deploymentId ?? "enterprise-rollout-foundation";
  return memoFoundation("enterprise-rollout-foundation", deploymentId, () => {
    const foundationId = `ERF-V37H18-${deploymentId.slice(0, 8)}`;
    const readiness = buildDeploymentReadinessConfig({ deploymentId });
    const summary = buildRolloutReadinessSummary({ deploymentId });
    const manifest = buildRolloutManifest({ deploymentId });

    return {
      version: PRODUCTION_ENTERPRISE_ROLLOUT_VERSION,
      foundationId,
      readiness,
      summary,
      manifest,
      foundationSummary: `enterprise-rollout-foundation id=${foundationId} readyForRollout=${manifest.readyForRollout} readyForDeployment=${manifest.readyForDeployment} confidence=${summary.confidenceScore} checks=${readiness.deploymentChecks.length + readiness.rolloutChecks.length}`,
    };
  });
}
