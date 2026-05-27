/**
 * V3.7-H14 Unified Dashboard — integration config (static aggregation)
 */

import { buildPortalLanding } from "../portal/portal-landing";
import { buildEnterpriseOpsManifest } from "../portal/enterprise-ops-manifest";

export const DASHBOARD_INTEGRATION_VERSION = "3.7-h14-integration-1" as const;

export type DashboardWidgetStatus = "pass" | "warn" | "fail";

export type DashboardWidget = {
  id: string;
  label: string;
  href: string;
  apiHref?: string;
  category: "ops" | "governance" | "audit" | "release" | "observability";
  summary: string;
  status: DashboardWidgetStatus;
};

export type DashboardIntegrationSection = {
  id: string;
  label: string;
  widgets: DashboardWidget[];
};

export type DashboardIntegration = {
  version: typeof DASHBOARD_INTEGRATION_VERSION;
  integrationId: string;
  sections: DashboardIntegrationSection[];
  widgets: DashboardWidget[];
  governanceWidgets: DashboardWidget[];
  auditWidgets: DashboardWidget[];
  releaseWidgets: DashboardWidget[];
  opsWidgets: DashboardWidget[];
  defaultWidget: string;
  summary: string;
};

function widgetStatus(accessible: boolean, ready: boolean): DashboardWidgetStatus {
  if (!accessible) return "fail";
  if (ready) return "pass";
  return "warn";
}

const STATIC_WIDGETS: Omit<DashboardWidget, "status">[] = [
  {
    id: "enterprise-ops",
    label: "Enterprise Ops",
    href: "/dashboard/ops",
    apiHref: "/api/commercialization/ops-overview",
    category: "ops",
    summary: "Unified enterprise ops portal landing.",
  },
  {
    id: "release-ledger",
    label: "Release Ledger",
    href: "/dashboard/release-ledger",
    apiHref: "/api/commercialization/release-ledger",
    category: "release",
    summary: "Production release ledger review.",
  },
  {
    id: "evidence-export",
    label: "Evidence Export",
    href: "/dashboard/evidence-export",
    apiHref: "/api/commercialization/evidence-export",
    category: "release",
    summary: "Static evidence chain export surface.",
  },
  {
    id: "audit-review",
    label: "Audit Review",
    href: "/dashboard/audit-review",
    apiHref: "/api/commercialization/audit",
    category: "audit",
    summary: "Audit snapshot and verification lineage.",
  },
  {
    id: "access-control",
    label: "Access Control",
    href: "/dashboard/access-control",
    apiHref: "/api/commercialization/access-control",
    category: "governance",
    summary: "Access matrix and permission review.",
  },
  {
    id: "policy-review",
    label: "Policy Review",
    href: "/dashboard/policy-review",
    apiHref: "/api/commercialization/policy-review",
    category: "governance",
    summary: "Effective access policy explanations.",
  },
  {
    id: "governance-review",
    label: "Governance Review",
    href: "/dashboard/governance-review",
    apiHref: "/api/commercialization/governance",
    category: "governance",
    summary: "Enterprise governance coverage review.",
  },
  {
    id: "permission-lineage",
    label: "Permission Lineage",
    href: "/dashboard/permission-lineage",
    apiHref: "/api/commercialization/permission-lineage",
    category: "governance",
    summary: "Role and permission lineage surface.",
  },
  {
    id: "commercial-ops",
    label: "Observability Ops",
    href: "/commercial/v37/operations",
    category: "observability",
    summary: "Commercial observability operations surface.",
  },
  {
    id: "dashboard-home",
    label: "User Dashboard",
    href: "/dashboard",
    category: "ops",
    summary: "User console entry point.",
  },
];

export function buildDashboardIntegration(input?: { deploymentId?: string }): DashboardIntegration {
  const deploymentId = input?.deploymentId ?? "dashboard-integration";
  const integrationId = `DIN-V37H14-${deploymentId.slice(0, 8)}`;
  const landing = buildPortalLanding({ deploymentId });
  const manifest = buildEnterpriseOpsManifest({ deploymentId });

  const linkAccessible = new Map(landing.landingSections.flatMap((s) => s.links).map((l) => [l.id, l.accessible]));

  const widgets: DashboardWidget[] = STATIC_WIDGETS.map((widget) => {
    const accessible =
      linkAccessible.get(widget.id) ??
      (widget.id === "enterprise-ops" || widget.id === "dashboard-home");
    let ready = manifest.readyForOps;
    if (widget.category === "governance") ready = manifest.readyForGovernance;
    if (widget.category === "release") ready = manifest.readyForRelease;
    if (widget.category === "audit") ready = manifest.readyForGovernance && manifest.readyForOps;
    if (widget.category === "observability") ready = manifest.readyForOps;

    return {
      ...widget,
      status: widgetStatus(Boolean(accessible), ready),
    };
  });

  const governanceWidgets = widgets.filter((w) => w.category === "governance");
  const auditWidgets = widgets.filter((w) => w.category === "audit");
  const releaseWidgets = widgets.filter((w) => w.category === "release");
  const opsWidgets = widgets.filter((w) => w.category === "ops");

  const sections: DashboardIntegrationSection[] = [
    { id: "ops", label: "Operations", widgets: opsWidgets },
    { id: "release", label: "Release", widgets: releaseWidgets },
    { id: "audit", label: "Audit", widgets: auditWidgets },
    { id: "governance", label: "Governance", widgets: governanceWidgets },
    {
      id: "observability",
      label: "Observability",
      widgets: widgets.filter((w) => w.category === "observability"),
    },
  ];

  return {
    version: DASHBOARD_INTEGRATION_VERSION,
    integrationId,
    sections,
    widgets,
    governanceWidgets,
    auditWidgets,
    releaseWidgets,
    opsWidgets,
    defaultWidget: "enterprise-ops",
    summary: `dashboard-integration id=${integrationId} widgets=${widgets.length} governance=${governanceWidgets.length} audit=${auditWidgets.length} release=${releaseWidgets.length} ops=${opsWidgets.length}`,
  };
}
