/**
 * V3.7-H16 Dashboard Shell Integration Foundation
 */

export {
  DASHBOARD_SHELL_NAV_VERSION,
  DASHBOARD_SHELL_NAVIGATION,
  getDashboardShellNavigation,
  type DashboardShellNavigation,
  type DashboardShellNavLink,
} from "./dashboard-shell-nav";

export {
  DASHBOARD_SHELL_SUMMARY_VERSION,
  buildDashboardShellSummary,
  type DashboardShellSummary,
  type DashboardShellSection,
} from "./dashboard-shell-summary";

export const PRODUCTION_DASHBOARD_SHELL_VERSION = "3.7-h16-foundation-1" as const;

import { getDashboardShellNavigation, type DashboardShellNavigation } from "./dashboard-shell-nav";
import { buildDashboardShellSummary, type DashboardShellSummary } from "./dashboard-shell-summary";

export type DashboardShellFoundation = {
  version: typeof PRODUCTION_DASHBOARD_SHELL_VERSION;
  foundationId: string;
  summary: DashboardShellSummary;
  navigation: DashboardShellNavigation;
  foundationSummary: string;
};

export function buildDashboardShellFoundation(input?: {
  deploymentId?: string;
}): DashboardShellFoundation {
  const deploymentId = input?.deploymentId ?? "dashboard-shell-foundation";
  const foundationId = `DSF-V37H16-${deploymentId.slice(0, 8)}`;
  const summary = buildDashboardShellSummary({ deploymentId });
  const navigation = getDashboardShellNavigation();

  return {
    version: PRODUCTION_DASHBOARD_SHELL_VERSION,
    foundationId,
    summary,
    navigation,
    foundationSummary: `dashboard-shell-foundation id=${foundationId} commandCenterAvailable=${summary.commandCenterAvailable} navLinks=${navigation.links.length}`,
  };
}
