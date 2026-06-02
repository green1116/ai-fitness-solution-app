/**
 * V3.7-H22 Enterprise Archival — static checklist (no runtime)
 */

export const ARCHIVAL_CHECKLIST_VERSION =
  "3.7-h22-archival-checklist-2" as const;

export type ArchivalStatus = "archived" | "pending";

export type PreservationGroup =
  | "release"
  | "governance"
  | "ops"
  | "audit"
  | "closure"
  | "preservation";

export type ArchivalItem = {
  id: string;
  label: string;
  group: PreservationGroup;
  status: ArchivalStatus;
  required: boolean;
  href?: string;
  apiHref?: string;
  description: string;
};

export type PreservationGroupConfig = {
  id: string;
  label: string;
  itemIds: string[];
};

export type ArchivalChecklist = {
  version: typeof ARCHIVAL_CHECKLIST_VERSION;
  checklistId: string;
  archivalItems: ArchivalItem[];
  preservationGroups: PreservationGroupConfig[];
  requiredArchivals: ArchivalItem[];
  governanceArchivals: ArchivalItem[];
  opsArchivals: ArchivalItem[];
  releaseArchivals: ArchivalItem[];
  summary: string;
};

function item(
  id: string,
  label: string,
  group: PreservationGroup,
  status: ArchivalStatus,
  required: boolean,
  description: string,
  href?: string,
  apiHref?: string,
): ArchivalItem {
  return { id, label, group, status, required, description, href, apiHref };
}

export function buildArchivalChecklist(input?: {
  deploymentId?: string;
}): ArchivalChecklist {
  const deploymentId = input?.deploymentId ?? "archival-checklist";
  const checklistId = `ACL-V37H22-${deploymentId.slice(0, 8)}`;

  const archivalItems: ArchivalItem[] = [
    item(
      "arc-launch-closure",
      "Launch closure archived",
      "closure",
      "archived",
      true,
      "Enterprise launch closure finalized for archival.",
      "/dashboard/launch-closure",
      "/api/commercialization/launch-closure",
    ),
    item(
      "arc-go-live",
      "Go-live control archived",
      "closure",
      "archived",
      true,
      "Production go-live control preserved.",
      "/dashboard/go-live",
      "/api/commercialization/go-live",
    ),
    item(
      "arc-rollout-readiness",
      "Rollout readiness archived",
      "preservation",
      "archived",
      true,
      "Enterprise rollout readiness preserved.",
      "/dashboard/rollout-readiness",
      "/api/commercialization/rollout-readiness",
    ),
    item(
      "arc-enterprise-landing",
      "Enterprise landing preserved",
      "preservation",
      "archived",
      true,
      "Enterprise landing and SaaS readiness preserved.",
      "/dashboard/enterprise-landing",
      "/api/commercialization/enterprise-landing",
    ),
    item(
      "arc-command-center",
      "Command center preserved",
      "ops",
      "archived",
      true,
      "Unified command center operational archive.",
      "/dashboard/command-center",
      "/api/commercialization/command-center",
    ),
    item(
      "arc-ops-portal",
      "Ops portal preserved",
      "ops",
      "archived",
      true,
      "Enterprise ops portal operational archive.",
      "/dashboard/ops",
      "/api/commercialization/ops-overview",
    ),
    item(
      "arc-governance",
      "Governance review archived",
      "governance",
      "archived",
      true,
      "Governance review and role catalog archived.",
      "/dashboard/governance-review",
      "/api/commercialization/governance",
    ),
    item(
      "arc-access",
      "Access governance archived",
      "governance",
      "archived",
      true,
      "Access matrix and policy review archived.",
      "/dashboard/access-control",
      "/api/commercialization/access-control",
    ),
    item(
      "arc-audit",
      "Audit review archived",
      "audit",
      "archived",
      true,
      "Audit snapshot and trace review archived.",
      "/dashboard/audit-review",
      "/api/commercialization/audit",
    ),
    item(
      "arc-release-ledger",
      "Release ledger archived",
      "release",
      "archived",
      true,
      "Production release ledger preserved.",
      "/dashboard/release-ledger",
      "/api/commercialization/release-ledger",
    ),
    item(
      "arc-evidence",
      "Evidence export preserved",
      "release",
      "archived",
      true,
      "Static evidence export for release preservation.",
      "/dashboard/evidence-export",
      "/api/commercialization/evidence-export",
    ),
    item(
      "arc-observability",
      "Observability ops preserved",
      "ops",
      "archived",
      false,
      "Commercial observability operations archive.",
      "/commercial/v37/operations",
    ),
    item(
      "arc-permission-lineage",
      "Permission lineage preserved",
      "governance",
      "archived",
      false,
      "Role and permission lineage for governance archive.",
      "/dashboard/permission-lineage",
      "/api/commercialization/permission-lineage",
    ),
    item(
      "arc-policy",
      "Policy review preserved",
      "governance",
      "archived",
      false,
      "Effective access policy for governance archive.",
      "/dashboard/policy-review",
      "/api/commercialization/policy-review",
    ),
  ];

  const preservationGroups: PreservationGroupConfig[] = [
    {
      id: "closure",
      label: "Launch Closure Archive",
      itemIds: ["arc-launch-closure", "arc-go-live"],
    },
    {
      id: "preservation",
      label: "Enterprise Preservation",
      itemIds: ["arc-rollout-readiness", "arc-enterprise-landing"],
    },
    {
      id: "ops",
      label: "Operational Archival",
      itemIds: ["arc-command-center", "arc-ops-portal", "arc-observability"],
    },
    {
      id: "governance",
      label: "Governance Archival",
      itemIds: [
        "arc-governance",
        "arc-access",
        "arc-permission-lineage",
        "arc-policy",
      ],
    },
    { id: "audit", label: "Audit Archival", itemIds: ["arc-audit"] },
    {
      id: "release",
      label: "Release Preservation",
      itemIds: ["arc-release-ledger", "arc-evidence"],
    },
  ];

  const requiredArchivals = archivalItems.filter((c) => c.required);
  const governanceArchivals = archivalItems.filter(
    (c) => c.group === "governance",
  );
  const opsArchivals = archivalItems.filter((c) => c.group === "ops");
  const releaseArchivals = archivalItems.filter((c) => c.group === "release");

  const passed = archivalItems.filter((c) => c.status === "archived").length;

  return {
    version: ARCHIVAL_CHECKLIST_VERSION,
    checklistId,
    archivalItems,
    preservationGroups,
    requiredArchivals,
    governanceArchivals,
    opsArchivals,
    releaseArchivals,
    summary: `archival-checklist id=${checklistId} items=${archivalItems.length} required=${requiredArchivals.length} archived=${passed} governance=${governanceArchivals.filter((c) => c.status === "archived").length} release=${releaseArchivals.filter((c) => c.status === "archived").length}`,
  };
}