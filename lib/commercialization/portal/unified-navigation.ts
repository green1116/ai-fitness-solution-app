/**
 * V3.7-H13 Enterprise Portal — unified navigation (static aggregation)
 */

import { buildOpsNavigation, type OpsNavigationEntry } from "../ops/ops-navigation";
import { buildLedgerAccessPolicy } from "../ops/ledger-access-policy";

export const UNIFIED_NAVIGATION_VERSION = "3.7-h13-unified-nav-1" as const;

export type UnifiedNavEntry = {
  id: string;
  label: string;
  href: string;
  apiHref?: string;
  group: string;
  description: string;
  accessible: boolean;
};

export type UnifiedNavSection = {
  id: string;
  label: string;
  entries: UnifiedNavEntry[];
};

export type UnifiedNavigation = {
  version: typeof UNIFIED_NAVIGATION_VERSION;
  navigationId: string;
  defaultLanding: string;
  sections: UnifiedNavSection[];
  entries: UnifiedNavEntry[];
  groups: string[];
  governanceEntries: UnifiedNavEntry[];
  auditEntries: UnifiedNavEntry[];
  releaseEntries: UnifiedNavEntry[];
  summary: string;
};

const EXTENDED_ENTRIES: Omit<UnifiedNavEntry, "accessible">[] = [
  {
    id: "ops-portal",
    label: "Enterprise Ops",
    href: "/dashboard/ops",
    apiHref: "/api/commercialization/ops-overview",
    group: "ops",
    description: "Unified enterprise ops landing surface.",
  },
  {
    id: "access-control",
    label: "Access Control",
    href: "/dashboard/access-control",
    apiHref: "/api/commercialization/access-control",
    group: "governance",
    description: "Access matrix and permission review.",
  },
  {
    id: "policy-review",
    label: "Policy Review",
    href: "/dashboard/policy-review",
    apiHref: "/api/commercialization/policy-review",
    group: "governance",
    description: "Effective access and policy explanations.",
  },
  {
    id: "governance-review",
    label: "Governance Review",
    href: "/dashboard/governance-review",
    apiHref: "/api/commercialization/governance",
    group: "governance",
    description: "Enterprise governance coverage review.",
  },
  {
    id: "permission-lineage",
    label: "Permission Lineage",
    href: "/dashboard/permission-lineage",
    apiHref: "/api/commercialization/permission-lineage",
    group: "governance",
    description: "Role and permission lineage surface.",
  },
];

const UNIFIED_GROUPS = [
  "ops",
  "release",
  "audit",
  "ledger",
  "evidence",
  "governance",
  "observability",
] as const;

function toUnifiedEntry(entry: OpsNavigationEntry): UnifiedNavEntry {
  return {
    id: entry.id,
    label: entry.label,
    href: entry.href,
    apiHref: entry.apiHref,
    group: entry.accessGroup === "ledger" ? "release" : entry.accessGroup,
    description: entry.description,
    accessible: entry.accessible,
  };
}

function extendedAccessible(
  entry: Omit<UnifiedNavEntry, "accessible">,
  policy: ReturnType<typeof buildLedgerAccessPolicy>,
): boolean {
  switch (entry.group) {
    case "governance":
      return policy.canViewAuditReview && policy.canViewReleaseLedger;
    case "ops":
      return policy.canViewDashboard;
    default:
      return false;
  }
}

export function buildUnifiedNavigation(input?: { deploymentId?: string }): UnifiedNavigation {
  const deploymentId = input?.deploymentId ?? "unified-navigation";
  const navigationId = `UNV-V37H13-${deploymentId.slice(0, 8)}`;
  const opsNav = buildOpsNavigation({ deploymentId });
  const policy = buildLedgerAccessPolicy({ deploymentId });

  const baseEntries = opsNav.entries.map(toUnifiedEntry);
  const extended = EXTENDED_ENTRIES.map((entry) => ({
    ...entry,
    accessible: extendedAccessible(entry, policy),
  }));

  const mergedById = new Map<string, UnifiedNavEntry>();
  for (const entry of [...baseEntries, ...extended]) {
    mergedById.set(entry.id, entry);
  }
  const entries = [...mergedById.values()];

  const sectionMap: Record<string, UnifiedNavSection> = {
    ops: { id: "ops", label: "Operations", entries: [] },
    release: { id: "release", label: "Release", entries: [] },
    audit: { id: "audit", label: "Audit", entries: [] },
    evidence: { id: "evidence", label: "Evidence", entries: [] },
    governance: { id: "governance", label: "Governance", entries: [] },
  };

  for (const entry of entries) {
    const group =
      entry.group === "ledger"
        ? "release"
        : entry.group === "observability"
          ? "ops"
          : entry.group;
    const section = sectionMap[group];
    if (section) section.entries.push(entry);
  }

  const sections = Object.values(sectionMap).filter((s) => s.entries.length > 0);
  const governanceEntries = entries.filter((e) => e.group === "governance");
  const auditEntries = entries.filter((e) => e.group === "audit");
  const releaseEntries = entries.filter(
    (e) => e.group === "release" || e.id === "release-ledger" || e.id === "release-stabilization",
  );

  return {
    version: UNIFIED_NAVIGATION_VERSION,
    navigationId,
    defaultLanding: "/dashboard/ops",
    sections,
    entries,
    groups: [...UNIFIED_GROUPS],
    governanceEntries,
    auditEntries,
    releaseEntries,
    summary: `unified-navigation id=${navigationId} entries=${entries.length} governance=${governanceEntries.length} audit=${auditEntries.length} release=${releaseEntries.length} landing=/dashboard/ops`,
  };
}
