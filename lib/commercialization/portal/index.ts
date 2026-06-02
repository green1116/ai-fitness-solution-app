/**
 * V3.7-H13 Unified Enterprise Ops Portal Foundation
 */

export {
  UNIFIED_NAVIGATION_VERSION,
  buildUnifiedNavigation,
  type UnifiedNavigation,
  type UnifiedNavEntry,
  type UnifiedNavSection,
} from "./unified-navigation";

export {
  ENTERPRISE_OPS_MANIFEST_VERSION,
  buildEnterpriseOpsManifest,
  type EnterpriseOpsManifest,
} from "./enterprise-ops-manifest";

export {
  PORTAL_LANDING_VERSION,
  buildPortalLanding,
  type PortalLanding,
  type PortalLink,
  type PortalLandingSection,
} from "./portal-landing";

export const PRODUCTION_ENTERPRISE_OPS_VERSION = "3.7-h13-foundation-1" as const;

import { buildUnifiedNavigation, type UnifiedNavigation } from "./unified-navigation";
import { buildEnterpriseOpsManifest, type EnterpriseOpsManifest } from "./enterprise-ops-manifest";
import { buildPortalLanding, type PortalLanding } from "./portal-landing";

export type EnterpriseOpsOverview = {
  version: typeof PRODUCTION_ENTERPRISE_OPS_VERSION;
  overviewId: string;
  navigation: UnifiedNavigation;
  manifest: EnterpriseOpsManifest;
  landing: PortalLanding;
  summary: string;
};

export function buildEnterpriseOpsOverview(input?: { deploymentId?: string }): EnterpriseOpsOverview {
  const deploymentId = input?.deploymentId ?? "enterprise-ops-overview";
  const overviewId = `EOV-V37H13-${deploymentId.slice(0, 8)}`;
  const navigation = buildUnifiedNavigation({ deploymentId });
  const manifest = buildEnterpriseOpsManifest({ deploymentId });
  const landing = buildPortalLanding({ deploymentId });

  return {
    version: PRODUCTION_ENTERPRISE_OPS_VERSION,
    overviewId,
    navigation,
    manifest,
    landing,
    summary: `enterprise-ops-overview id=${overviewId} readyForOps=${manifest.readyForOps} readyForGovernance=${manifest.readyForGovernance} readyForRelease=${manifest.readyForRelease} entries=${navigation.entries.length}`,
  };
}
