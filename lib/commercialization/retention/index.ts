/**
 * V3.7-H23 Enterprise Retention Foundation
 */

export {
  RETENTION_POLICY_VERSION,
  buildRetentionPolicyConfig,
  type RetentionPolicyItem,
  type RetentionPolicyConfig,
} from "./retention-policy";

export {
  ARCHIVE_ACCESS_SUMMARY_VERSION,
  buildArchiveAccessSummary,
  type ArchiveAccessSummary,
} from "./archive-access-summary";

export {
  RETENTION_MANIFEST_VERSION,
  RETENTION_VERSION,
  buildRetentionManifest,
  type RetentionManifest,
} from "./retention-manifest";

import { memoFoundation } from "../foundation-memo";
import { buildRetentionPolicyConfig, type RetentionPolicyConfig } from "./retention-policy";
import { buildArchiveAccessSummary, type ArchiveAccessSummary } from "./archive-access-summary";
import { buildRetentionManifest, RETENTION_VERSION, type RetentionManifest } from "./retention-manifest";

export const PRODUCTION_RETENTION_VERSION = RETENTION_VERSION;

export type EnterpriseRetentionFoundation = {
  version: typeof PRODUCTION_RETENTION_VERSION;
  foundationId: string;
  policies: RetentionPolicyConfig;
  access: ArchiveAccessSummary;
  manifest: RetentionManifest;
  foundationSummary: string;
};

export function buildEnterpriseRetentionFoundation(input?: {
  deploymentId?: string;
}): EnterpriseRetentionFoundation {
  const deploymentId = input?.deploymentId ?? "enterprise-retention-foundation";
  return memoFoundation("enterprise-retention-foundation", deploymentId, () => {
    const foundationId = `ERF-V37H23-${deploymentId.slice(0, 8)}`;
    const policies = buildRetentionPolicyConfig({ deploymentId });
    const access = buildArchiveAccessSummary({ deploymentId });
    const manifest = buildRetentionManifest({ deploymentId });

    const policyCount =
      policies.retentionPolicies.length +
      policies.lifecyclePolicies.length +
      policies.governancePolicies.length;

    return {
      version: PRODUCTION_RETENTION_VERSION,
      foundationId,
      policies,
      access,
      manifest,
      foundationSummary: `enterprise-retention-foundation id=${foundationId} readyForRetention=${manifest.readyForRetention} readyForLifecycle=${manifest.readyForLifecycle} policies=${policyCount} confidence=${access.confidenceScore}`,
    };
  });
}
