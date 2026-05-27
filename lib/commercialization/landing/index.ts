/**
 * V3.7-H17 Enterprise Landing Foundation
 */

export {
  LANDING_CARDS_VERSION,
  getLandingCardsConfig,
  type LandingCard,
  type LandingCategory,
  type LandingQuickAction,
  type LandingCardsConfig,
} from "./landing-cards";

export {
  SAAS_READINESS_VERSION,
  buildSaasReadinessSummary,
  type SaasReadinessSummary,
} from "./saas-readiness";

export {
  LANDING_MANIFEST_VERSION,
  LANDING_VERSION,
  buildLandingManifest,
  type LandingManifest,
} from "./landing-manifest";

import { memoFoundation } from "../foundation-memo";
import { getLandingCardsConfig, type LandingCardsConfig } from "./landing-cards";
import { buildSaasReadinessSummary, type SaasReadinessSummary } from "./saas-readiness";
import { buildLandingManifest, LANDING_VERSION, type LandingManifest } from "./landing-manifest";

export const PRODUCTION_ENTERPRISE_LANDING_VERSION = LANDING_VERSION;

export type EnterpriseLandingFoundation = {
  version: typeof PRODUCTION_ENTERPRISE_LANDING_VERSION;
  foundationId: string;
  cards: LandingCardsConfig;
  readiness: SaasReadinessSummary;
  manifest: LandingManifest;
  foundationSummary: string;
};

export function buildEnterpriseLandingFoundation(input?: {
  deploymentId?: string;
}): EnterpriseLandingFoundation {
  const deploymentId = input?.deploymentId ?? "enterprise-landing-foundation";
  return memoFoundation("enterprise-landing-foundation", deploymentId, () => {
    const foundationId = `ELF-V37H17-${deploymentId.slice(0, 8)}`;
    const cards = getLandingCardsConfig();
    const readiness = buildSaasReadinessSummary({ deploymentId });
    const manifest = buildLandingManifest({ deploymentId });

    return {
      version: PRODUCTION_ENTERPRISE_LANDING_VERSION,
      foundationId,
      cards,
      readiness,
      manifest,
      foundationSummary: `enterprise-landing-foundation id=${foundationId} readyForLanding=${manifest.readyForLanding} readyForDeployment=${manifest.readyForDeployment} cards=${cards.cards.length} quickActions=${cards.quickActions.length} confidence=${readiness.confidenceScore}`,
    };
  });
}
