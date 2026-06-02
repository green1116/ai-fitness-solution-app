/**
 * V3.7-H8 Production Ops Portal Foundation
 */

export {
  OPS_PORTAL_CONFIG_VERSION,
  OPS_PORTAL_CONFIG,
  OPS_PORTAL_ACCESS_GROUPS,
  getOpsPortalConfig,
  type OpsPortalConfig,
  type OpsPortalSection,
  type OpsPortalEntry,
  type OpsPortalBadge,
  type OpsPortalAccessGroup,
} from "./ops-portal.config";

export {
  OPS_PORTAL_MANIFEST_VERSION,
  buildOpsPortalManifest,
  type OpsPortalManifest,
  type OpsPortalStatus,
} from "./ops-portal-manifest";

export {
  LEDGER_ACCESS_POLICY_VERSION,
  buildLedgerAccessPolicy,
  type LedgerAccessPolicy,
} from "./ledger-access-policy";

export {
  OPS_NAVIGATION_VERSION,
  buildOpsNavigation,
  buildOpsNavigationSummary,
  type OpsNavigation,
  type OpsNavigationSection,
  type OpsNavigationEntry,
} from "./ops-navigation";

export const PRODUCTION_OPS_PORTAL_VERSION = "3.7-h8-foundation-1" as const;

import { getOpsPortalConfig, type OpsPortalConfig } from "./ops-portal.config";
import { buildOpsPortalManifest, type OpsPortalManifest } from "./ops-portal-manifest";
import { buildLedgerAccessPolicy, type LedgerAccessPolicy } from "./ledger-access-policy";
import { buildOpsNavigation, type OpsNavigation } from "./ops-navigation";

export type ProductionOpsPortalFoundation = {
  version: typeof PRODUCTION_OPS_PORTAL_VERSION;
  foundationId: string;
  config: OpsPortalConfig;
  manifest: OpsPortalManifest;
  accessPolicy: LedgerAccessPolicy;
  navigation: OpsNavigation;
  summary: string;
};

export function buildProductionOpsPortalFoundation(input?: {
  deploymentId?: string;
}): ProductionOpsPortalFoundation {
  const deploymentId = input?.deploymentId ?? "ops-portal-foundation";
  const foundationId = `POP-V37H8-${deploymentId.slice(0, 8)}`;
  const config = getOpsPortalConfig();
  const manifest = buildOpsPortalManifest({ deploymentId });
  const accessPolicy = buildLedgerAccessPolicy({ deploymentId });
  const navigation = buildOpsNavigation({ deploymentId });

  return {
    version: PRODUCTION_OPS_PORTAL_VERSION,
    foundationId,
    config,
    manifest,
    accessPolicy,
    navigation,
    summary: `production-ops-portal id=${foundationId} readyForOps=${manifest.readyForOps} accessible=${navigation.entries.filter((e) => e.accessible).length} landing=${config.defaultLanding}`,
  };
}
