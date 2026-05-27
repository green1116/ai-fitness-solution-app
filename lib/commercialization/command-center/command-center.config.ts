/**
 * V3.7-H15 Enterprise Command Center — static config (no real auth)
 */

export const COMMAND_CENTER_CONFIG_VERSION = "3.7-h15-config-1" as const;

export type CommandCenterModule = {
  id: string;
  label: string;
  href: string;
  apiHref?: string;
  section: string;
  description: string;
};

export type CommandCenterShortcut = {
  id: string;
  label: string;
  href: string;
  apiHref?: string;
  category: string;
};

export type CommandCenterSection = {
  id: string;
  label: string;
  modules: CommandCenterModule[];
};

export type CommandCenterVisibilityRule = {
  id: string;
  moduleId: string;
  visible: boolean;
  reason: string;
};

export type CommandCenterConfig = {
  version: typeof COMMAND_CENTER_CONFIG_VERSION;
  defaultLanding: string;
  defaultView: string;
  sections: CommandCenterSection[];
  modules: CommandCenterModule[];
  shortcuts: CommandCenterShortcut[];
  visibilityRules: CommandCenterVisibilityRule[];
};

const MODULES: CommandCenterModule[] = [
  {
    id: "command-center",
    label: "Command Center",
    href: "/dashboard/command-center",
    apiHref: "/api/commercialization/command-center",
    section: "core",
    description: "Unified enterprise command center landing.",
  },
  {
    id: "enterprise-dashboard",
    label: "Enterprise Dashboard",
    href: "/dashboard/enterprise",
    apiHref: "/api/commercialization/dashboard-overview",
    section: "dashboard",
    description: "Unified enterprise dashboard integration.",
  },
  {
    id: "enterprise-ops",
    label: "Enterprise Ops",
    href: "/dashboard/ops",
    apiHref: "/api/commercialization/ops-overview",
    section: "ops",
    description: "Unified ops portal and navigation.",
  },
  {
    id: "release-ledger",
    label: "Release Ledger",
    href: "/dashboard/release-ledger",
    apiHref: "/api/commercialization/release-ledger",
    section: "release",
    description: "Production release ledger review.",
  },
  {
    id: "evidence-export",
    label: "Evidence Export",
    href: "/dashboard/evidence-export",
    apiHref: "/api/commercialization/evidence-export",
    section: "release",
    description: "Static evidence export surface.",
  },
  {
    id: "audit-review",
    label: "Audit Review",
    href: "/dashboard/audit-review",
    apiHref: "/api/commercialization/audit",
    section: "audit",
    description: "Audit snapshot and trace review.",
  },
  {
    id: "access-control",
    label: "Access Control",
    href: "/dashboard/access-control",
    apiHref: "/api/commercialization/access-control",
    section: "access",
    description: "Access matrix and policy review.",
  },
  {
    id: "governance-review",
    label: "Governance Review",
    href: "/dashboard/governance-review",
    apiHref: "/api/commercialization/governance",
    section: "governance",
    description: "Enterprise governance coverage.",
  },
  {
    id: "permission-lineage",
    label: "Permission Lineage",
    href: "/dashboard/permission-lineage",
    apiHref: "/api/commercialization/permission-lineage",
    section: "governance",
    description: "Role and permission lineage.",
  },
  {
    id: "policy-review",
    label: "Policy Review",
    href: "/dashboard/policy-review",
    apiHref: "/api/commercialization/policy-review",
    section: "access",
    description: "Effective access policy explanations.",
  },
  {
    id: "observability-ops",
    label: "Observability Ops",
    href: "/commercial/v37/operations",
    section: "observability",
    description: "Commercial observability operations.",
  },
  {
    id: "user-dashboard",
    label: "User Dashboard",
    href: "/dashboard",
    section: "dashboard",
    description: "User console entry.",
  },
];

const SHORTCUTS: CommandCenterShortcut[] = [
  { id: "sc-ops", label: "Ops Portal", href: "/dashboard/ops", apiHref: "/api/commercialization/ops-overview", category: "ops" },
  { id: "sc-enterprise", label: "Enterprise Dashboard", href: "/dashboard/enterprise", apiHref: "/api/commercialization/dashboard-overview", category: "dashboard" },
  { id: "sc-release", label: "Release Ledger", href: "/dashboard/release-ledger", apiHref: "/api/commercialization/release-ledger", category: "release" },
  { id: "sc-audit", label: "Audit Review", href: "/dashboard/audit-review", apiHref: "/api/commercialization/audit", category: "audit" },
  { id: "sc-governance", label: "Governance", href: "/dashboard/governance-review", apiHref: "/api/commercialization/governance", category: "governance" },
  { id: "sc-access", label: "Access Control", href: "/dashboard/access-control", apiHref: "/api/commercialization/access-control", category: "access" },
  { id: "sc-evidence", label: "Evidence", href: "/dashboard/evidence-export", apiHref: "/api/commercialization/evidence-export", category: "release" },
  { id: "sc-lineage", label: "Lineage", href: "/dashboard/permission-lineage", apiHref: "/api/commercialization/permission-lineage", category: "governance" },
];

function buildSections(modules: CommandCenterModule[]): CommandCenterSection[] {
  const sectionIds = ["core", "ops", "dashboard", "release", "audit", "governance", "access", "observability"];
  const labels: Record<string, string> = {
    core: "Command Center",
    ops: "Operations",
    dashboard: "Dashboard",
    release: "Release",
    audit: "Audit",
    governance: "Governance",
    access: "Access Control",
    observability: "Observability",
  };
  return sectionIds
    .map((id) => ({
      id,
      label: labels[id] ?? id,
      modules: modules.filter((m) => m.section === id),
    }))
    .filter((s) => s.modules.length > 0);
}

export function getCommandCenterConfig(): CommandCenterConfig {
  const modules = MODULES;
  return {
    version: COMMAND_CENTER_CONFIG_VERSION,
    defaultLanding: "/dashboard/command-center",
    defaultView: "overview",
    sections: buildSections(modules),
    modules,
    shortcuts: SHORTCUTS,
    visibilityRules: modules.map((m) => ({
      id: `vis-${m.id}`,
      moduleId: m.id,
      visible: true,
      reason: "Static readonly command center — visible when baseline signals pass.",
    })),
  };
}
