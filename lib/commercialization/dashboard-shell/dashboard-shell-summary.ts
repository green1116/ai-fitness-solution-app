/**
 * V3.7-H16 Dashboard Shell — static summary (readonly aggregation)
 */

import { buildCommandCenterManifest } from "../command-center/command-center-manifest";
import { getDashboardShellNavigation } from "./dashboard-shell-nav";

export const DASHBOARD_SHELL_SUMMARY_VERSION = "3.7-h16-shell-summary-1" as const;

export type DashboardShellSection = {
  id: string;
  label: string;
  href: string;
};

export type DashboardShellSummary = {
  version: typeof DASHBOARD_SHELL_SUMMARY_VERSION;
  summaryId: string;
  currentLanding: string;
  primaryShortcut: string;
  commandCenterAvailable: boolean;
  dashboardSections: DashboardShellSection[];
  navigationLinkCount: number;
  summary: string;
};

const DASHBOARD_SECTIONS: DashboardShellSection[] = [
  { id: "plan", label: "创建方案", href: "/plan" },
  { id: "command-center", label: "Command Center", href: "/dashboard/command-center" },
  { id: "enterprise", label: "Enterprise Dashboard", href: "/dashboard/enterprise" },
  { id: "ops", label: "Enterprise Ops", href: "/dashboard/ops" },
];

export function buildDashboardShellSummary(input?: { deploymentId?: string }): DashboardShellSummary {
  const deploymentId = input?.deploymentId ?? "dashboard-shell";
  const summaryId = `DSS-V37H16-${deploymentId.slice(0, 8)}`;
  const manifest = buildCommandCenterManifest({ deploymentId });
  const navigation = getDashboardShellNavigation();

  return {
    version: DASHBOARD_SHELL_SUMMARY_VERSION,
    summaryId,
    currentLanding: "/dashboard",
    primaryShortcut: "/dashboard/command-center",
    commandCenterAvailable: manifest.readyForCommandCenter,
    dashboardSections: DASHBOARD_SECTIONS,
    navigationLinkCount: navigation.links.length,
    summary: `dashboard-shell id=${summaryId} landing=/dashboard primary=/dashboard/command-center available=${manifest.readyForCommandCenter} sections=${DASHBOARD_SECTIONS.length}`,
  };
}
