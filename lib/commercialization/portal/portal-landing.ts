/**
 * V3.7-H13 Enterprise Portal — portal landing builder (static aggregation)
 */

import { buildUnifiedNavigation, type UnifiedNavEntry } from "./unified-navigation";
import { buildEnterpriseOpsManifest } from "./enterprise-ops-manifest";

export const PORTAL_LANDING_VERSION = "3.7-h13-landing-1" as const;

export type PortalLink = {
  id: string;
  label: string;
  href: string;
  apiHref?: string;
  summary: string;
  accessible: boolean;
};

export type PortalLandingSection = {
  id: string;
  label: string;
  links: PortalLink[];
};

export type PortalLanding = {
  version: typeof PORTAL_LANDING_VERSION;
  landingId: string;
  landingSections: PortalLandingSection[];
  quickLinks: PortalLink[];
  governanceLinks: PortalLink[];
  releaseLinks: PortalLink[];
  auditLinks: PortalLink[];
  evidenceLinks: PortalLink[];
  summary: string;
};

function toLink(entry: UnifiedNavEntry): PortalLink {
  return {
    id: entry.id,
    label: entry.label,
    href: entry.href,
    apiHref: entry.apiHref,
    summary: entry.description,
    accessible: entry.accessible,
  };
}

export function buildPortalLanding(input?: { deploymentId?: string }): PortalLanding {
  const deploymentId = input?.deploymentId ?? "portal-landing";
  const landingId = `PLD-V37H13-${deploymentId.slice(0, 8)}`;
  const navigation = buildUnifiedNavigation({ deploymentId });
  const manifest = buildEnterpriseOpsManifest({ deploymentId });

  const allLinks = navigation.entries.map(toLink);
  const quickLinks = allLinks.filter((l) => l.accessible).slice(0, 6);
  const governanceLinks = navigation.governanceEntries.map(toLink);
  const releaseLinks = navigation.releaseEntries.map(toLink);
  const auditLinks = navigation.auditEntries.map(toLink);
  const evidenceLinks = allLinks.filter((l) => l.id === "evidence-export");

  const landingSections: PortalLandingSection[] = navigation.sections.map((section) => ({
    id: section.id,
    label: section.label,
    links: section.entries.map(toLink),
  }));

  return {
    version: PORTAL_LANDING_VERSION,
    landingId,
    landingSections,
    quickLinks,
    governanceLinks,
    releaseLinks,
    auditLinks,
    evidenceLinks,
    summary: `portal-landing id=${landingId} readyForOps=${manifest.readyForOps} sections=${landingSections.length} quickLinks=${quickLinks.length}`,
  };
}
