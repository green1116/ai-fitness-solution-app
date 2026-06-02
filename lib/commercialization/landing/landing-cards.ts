/**
 * V3.7-H17 Enterprise Landing — static cards config (no runtime)
 */

export const LANDING_CARDS_VERSION = "3.7-h17-cards-1" as const;

export type LandingCard = {
  id: string;
  label: string;
  href: string;
  apiHref?: string;
  category: string;
  description: string;
  tags: string[];
};

export type LandingCategory = {
  id: string;
  label: string;
  cardIds: string[];
};

export type LandingQuickAction = {
  id: string;
  label: string;
  href: string;
  category: string;
};

export type LandingCardsConfig = {
  version: typeof LANDING_CARDS_VERSION;
  cards: LandingCard[];
  categories: LandingCategory[];
  quickActions: LandingQuickAction[];
  readinessCards: LandingCard[];
  governanceCards: LandingCard[];
  releaseCards: LandingCard[];
  auditCards: LandingCard[];
};

const ALL_CARDS: LandingCard[] = [
  {
    id: "dashboard-shell",
    label: "Dashboard Shell",
    href: "/dashboard",
    category: "core",
    description: "Unified dashboard shell with command center entry.",
    tags: ["dashboard", "shell", "entry"],
  },
  {
    id: "command-center",
    label: "Command Center",
    href: "/dashboard/command-center",
    apiHref: "/api/commercialization/command-center",
    category: "core",
    description: "Enterprise command center — unified ops, governance, audit, release.",
    tags: ["command-center", "unified", "ops"],
  },
  {
    id: "enterprise-ops",
    label: "Enterprise Ops",
    href: "/dashboard/ops",
    apiHref: "/api/commercialization/ops-overview",
    category: "ops",
    description: "Unified ops portal and navigation.",
    tags: ["ops", "portal", "navigation"],
  },
  {
    id: "enterprise-dashboard",
    label: "Enterprise Dashboard",
    href: "/dashboard/enterprise",
    apiHref: "/api/commercialization/dashboard-overview",
    category: "dashboard",
    description: "Unified enterprise dashboard integration.",
    tags: ["dashboard", "integration", "widgets"],
  },
  {
    id: "governance-review",
    label: "Governance Review",
    href: "/dashboard/governance-review",
    apiHref: "/api/commercialization/governance",
    category: "governance",
    description: "Enterprise governance coverage and role catalog.",
    tags: ["governance", "roles", "permissions"],
  },
  {
    id: "permission-lineage",
    label: "Permission Lineage",
    href: "/dashboard/permission-lineage",
    apiHref: "/api/commercialization/permission-lineage",
    category: "governance",
    description: "Role and permission lineage review.",
    tags: ["governance", "lineage", "access"],
  },
  {
    id: "release-ledger",
    label: "Release Ledger",
    href: "/dashboard/release-ledger",
    apiHref: "/api/commercialization/release-ledger",
    category: "release",
    description: "Production release ledger review.",
    tags: ["release", "ledger", "deployment"],
  },
  {
    id: "evidence-export",
    label: "Evidence Export",
    href: "/dashboard/evidence-export",
    apiHref: "/api/commercialization/evidence-export",
    category: "release",
    description: "Static evidence export surface.",
    tags: ["release", "evidence", "export"],
  },
  {
    id: "audit-review",
    label: "Audit Review",
    href: "/dashboard/audit-review",
    apiHref: "/api/commercialization/audit",
    category: "audit",
    description: "Audit snapshot and trace review.",
    tags: ["audit", "trace", "compliance"],
  },
  {
    id: "access-control",
    label: "Access Control",
    href: "/dashboard/access-control",
    apiHref: "/api/commercialization/access-control",
    category: "access",
    description: "Access matrix and policy review.",
    tags: ["access", "policy", "matrix"],
  },
  {
    id: "policy-review",
    label: "Policy Review",
    href: "/dashboard/policy-review",
    apiHref: "/api/commercialization/policy-review",
    category: "access",
    description: "Effective access policy explanations.",
    tags: ["access", "policy", "review"],
  },
  {
    id: "observability-ops",
    label: "Observability Ops",
    href: "/commercial/v37/operations",
    category: "observability",
    description: "Commercial observability operations surface.",
    tags: ["observability", "ops", "monitoring"],
  },
];

const CATEGORIES: LandingCategory[] = [
  { id: "core", label: "Core", cardIds: ["dashboard-shell", "command-center"] },
  { id: "ops", label: "Operations", cardIds: ["enterprise-ops", "observability-ops"] },
  { id: "dashboard", label: "Dashboard", cardIds: ["enterprise-dashboard", "dashboard-shell"] },
  { id: "governance", label: "Governance", cardIds: ["governance-review", "permission-lineage"] },
  { id: "release", label: "Release", cardIds: ["release-ledger", "evidence-export"] },
  { id: "audit", label: "Audit", cardIds: ["audit-review"] },
  { id: "access", label: "Access Control", cardIds: ["access-control", "policy-review"] },
];

const QUICK_ACTIONS: LandingQuickAction[] = [
  { id: "qa-command-center", label: "Command Center", href: "/dashboard/command-center", category: "core" },
  { id: "qa-ops", label: "Ops Portal", href: "/dashboard/ops", category: "ops" },
  { id: "qa-governance", label: "Governance", href: "/dashboard/governance-review", category: "governance" },
  { id: "qa-release", label: "Release Ledger", href: "/dashboard/release-ledger", category: "release" },
  { id: "qa-audit", label: "Audit Review", href: "/dashboard/audit-review", category: "audit" },
  { id: "qa-access", label: "Access Control", href: "/dashboard/access-control", category: "access" },
  { id: "qa-evidence", label: "Evidence Export", href: "/dashboard/evidence-export", category: "release" },
  { id: "qa-observability", label: "Observability", href: "/commercial/v37/operations", category: "observability" },
];

function pickCards(ids: string[]): LandingCard[] {
  return ids.map((id) => ALL_CARDS.find((c) => c.id === id)).filter(Boolean) as LandingCard[];
}

export function getLandingCardsConfig(): LandingCardsConfig {
  return {
    version: LANDING_CARDS_VERSION,
    cards: ALL_CARDS,
    categories: CATEGORIES,
    quickActions: QUICK_ACTIONS,
    readinessCards: pickCards([
      "command-center",
      "enterprise-ops",
      "governance-review",
      "release-ledger",
      "audit-review",
      "access-control",
      "observability-ops",
    ]),
    governanceCards: pickCards(["governance-review", "permission-lineage"]),
    releaseCards: pickCards(["release-ledger", "evidence-export"]),
    auditCards: pickCards(["audit-review"]),
  };
}
