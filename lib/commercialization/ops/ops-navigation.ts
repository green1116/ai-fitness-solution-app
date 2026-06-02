/**
 * V3.7-H8 Ops Portal — navigation builder (readonly aggregation)
 */

import {
  getOpsPortalConfig,
  type OpsPortalEntry,
  type OpsPortalSection,
} from "./ops-portal.config";
import { buildOpsPortalManifest } from "./ops-portal-manifest";
import { buildLedgerAccessPolicy } from "./ledger-access-policy";

export const OPS_NAVIGATION_VERSION = "3.7-h8-navigation-1" as const;

export type OpsNavigationEntry = OpsPortalEntry & {
  accessible: boolean;
};

export type OpsNavigationSection = {
  id: string;
  label: string;
  entries: OpsNavigationEntry[];
};

export type OpsNavigation = {
  version: typeof OPS_NAVIGATION_VERSION;
  navigationId: string;
  defaultLanding: string;
  readyForOps: boolean;
  sections: OpsNavigationSection[];
  entries: OpsNavigationEntry[];
  summary: string;
};

function isAccessible(entry: OpsPortalEntry, policy: ReturnType<typeof buildLedgerAccessPolicy>): boolean {
  switch (entry.accessGroup) {
    case "ledger":
      return policy.canViewReleaseLedger;
    case "evidence":
      return policy.canViewEvidenceExport;
    case "audit":
      return policy.canViewAuditReview;
    case "ops":
      return policy.canViewDashboard;
    case "observability":
      return policy.canViewObservability;
    case "release":
      return policy.canViewDashboard || policy.canViewReleaseLedger;
    default:
      return false;
  }
}

function mapSection(section: OpsPortalSection, policy: ReturnType<typeof buildLedgerAccessPolicy>): OpsNavigationSection {
  const entries = section.entries.map((entry) => ({
    ...entry,
    accessible: isAccessible(entry, policy),
  }));
  return { id: section.id, label: section.label, entries };
}

export function buildOpsNavigation(input?: { deploymentId?: string }): OpsNavigation {
  const deploymentId = input?.deploymentId ?? "ops-navigation";
  const navigationId = `NAV-V37H8-${deploymentId.slice(0, 8)}`;
  const config = getOpsPortalConfig();
  const manifest = buildOpsPortalManifest({ deploymentId });
  const policy = buildLedgerAccessPolicy({ deploymentId });

  const sections = config.sections.map((section) => mapSection(section, policy));
  const entries = sections.flatMap((section) => section.entries);
  const accessibleCount = entries.filter((e) => e.accessible).length;

  return {
    version: OPS_NAVIGATION_VERSION,
    navigationId,
    defaultLanding: config.defaultLanding,
    readyForOps: manifest.readyForOps,
    sections,
    entries,
    summary: `ops-navigation id=${navigationId} readyForOps=${manifest.readyForOps} entries=${entries.length} accessible=${accessibleCount} landing=${config.defaultLanding}`,
  };
}

export function buildOpsNavigationSummary(input?: { deploymentId?: string }): string {
  return buildOpsNavigation(input).summary;
}
