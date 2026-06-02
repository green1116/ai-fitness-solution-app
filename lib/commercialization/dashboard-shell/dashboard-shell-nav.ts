/**
 * V3.7-H16 Dashboard Shell — static navigation mapping (readonly)
 */

export const DASHBOARD_SHELL_NAV_VERSION = "3.7-h16-shell-nav-1" as const;

export type DashboardShellNavLink = {
  id: string;
  from: string;
  to: string;
  label: string;
};

export type DashboardShellNavigation = {
  version: typeof DASHBOARD_SHELL_NAV_VERSION;
  links: DashboardShellNavLink[];
};

/** Static dashboard shell navigation — dashboard → command center → domain surfaces. */
export const DASHBOARD_SHELL_NAVIGATION: DashboardShellNavigation = {
  version: DASHBOARD_SHELL_NAV_VERSION,
  links: [
    { id: "dash-to-cc", from: "/dashboard", to: "/dashboard/command-center", label: "Command Center" },
    { id: "cc-to-ops", from: "/dashboard/command-center", to: "/dashboard/ops", label: "Enterprise Ops" },
    { id: "cc-to-governance", from: "/dashboard/command-center", to: "/dashboard/governance-review", label: "Governance" },
    { id: "cc-to-audit", from: "/dashboard/command-center", to: "/dashboard/audit-review", label: "Audit" },
    { id: "cc-to-release", from: "/dashboard/command-center", to: "/dashboard/release-ledger", label: "Release" },
    { id: "cc-to-access", from: "/dashboard/command-center", to: "/dashboard/access-control", label: "Access Control" },
    { id: "cc-to-evidence", from: "/dashboard/command-center", to: "/dashboard/evidence-export", label: "Evidence" },
    { id: "cc-to-enterprise", from: "/dashboard/command-center", to: "/dashboard/enterprise", label: "Enterprise Dashboard" },
  ],
};

export function getDashboardShellNavigation(): DashboardShellNavigation {
  return DASHBOARD_SHELL_NAVIGATION;
}
