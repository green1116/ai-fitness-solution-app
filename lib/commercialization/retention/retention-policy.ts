/**
 * V3.7-H23 Enterprise Retention — static policy config (no runtime)
 */

import { buildEnterpriseArchivalFoundation } from "../archival/index";

export const RETENTION_POLICY_VERSION = "3.7-h23-policy-1" as const;

export type RetentionPolicyItem = {
  id: string;
  label: string;
  category: string;
  readonly: boolean;
  reviewRequired: boolean;
  href?: string;
  apiHref?: string;
  description: string;
};

export type RetentionPolicyConfig = {
  version: typeof RETENTION_POLICY_VERSION;
  policyId: string;
  retentionPolicies: RetentionPolicyItem[];
  lifecyclePolicies: RetentionPolicyItem[];
  governancePolicies: RetentionPolicyItem[];
  archivalPolicies: RetentionPolicyItem[];
  readonlyPolicies: RetentionPolicyItem[];
  reviewPolicies: RetentionPolicyItem[];
  summary: string;
};

function policy(
  id: string,
  label: string,
  category: string,
  readonly: boolean,
  reviewRequired: boolean,
  description: string,
  href?: string,
  apiHref?: string,
): RetentionPolicyItem {
  return { id, label, category, readonly, reviewRequired, description, href, apiHref };
}

export function buildRetentionPolicyConfig(input?: {
  deploymentId?: string;
}): RetentionPolicyConfig {
  const deploymentId = input?.deploymentId ?? "retention-policy";
  const policyId = `RTP-V37H23-${deploymentId.slice(0, 8)}`;

  const archival = buildEnterpriseArchivalFoundation({ deploymentId });
  const p = archival.preservation;

  const retentionPolicies: RetentionPolicyItem[] = [
    policy("ret-archival", "Archival retention baseline", "retention", true, true, "Enterprise archival foundation retention policy.", "/dashboard/archival", "/api/commercialization/archival"),
    policy("ret-launch-closure", "Launch closure retention", "retention", true, true, "Launch closure records retained for enterprise lifecycle.", "/dashboard/launch-closure", "/api/commercialization/launch-closure"),
    policy("ret-go-live", "Go-live control retention", "retention", true, true, "Go-live control records retained for production review.", "/dashboard/go-live", "/api/commercialization/go-live"),
    policy("ret-rollout", "Rollout readiness retention", "retention", true, false, "Rollout readiness snapshots retained.", "/dashboard/rollout-readiness", "/api/commercialization/rollout-readiness"),
  ];

  const lifecyclePolicies: RetentionPolicyItem[] = [
    policy("lc-enterprise-landing", "Enterprise landing lifecycle", "lifecycle", true, false, "Enterprise landing preserved across lifecycle.", "/dashboard/enterprise-landing", "/api/commercialization/enterprise-landing"),
    policy("lc-command-center", "Command center lifecycle", "lifecycle", true, false, "Command center operational lifecycle retention.", "/dashboard/command-center", "/api/commercialization/command-center"),
    policy("lc-rollout", "Rollout launch lifecycle", "lifecycle", true, true, "Production rollout launch checklist lifecycle.", "/dashboard/rollout", "/api/commercialization/rollout"),
    policy("lc-preservation", "Preservation lifecycle gate", "lifecycle", true, p.preservationCompleted, "Preservation completion lifecycle policy.", "/dashboard/archival"),
  ];

  const governancePolicies: RetentionPolicyItem[] = [
    policy("gov-review", "Governance review retention", "governance", true, true, "Governance review records retained.", "/dashboard/governance-review", "/api/commercialization/governance"),
    policy("gov-access", "Access governance retention", "governance", true, true, "Access matrix retention for governance audit.", "/dashboard/access-control", "/api/commercialization/access-control"),
    policy("gov-lineage", "Permission lineage retention", "governance", true, false, "Permission lineage retained for governance review.", "/dashboard/permission-lineage", "/api/commercialization/permission-lineage"),
    policy("gov-policy", "Policy review retention", "governance", true, false, "Effective policy explanations retained.", "/dashboard/policy-review", "/api/commercialization/policy-review"),
  ];

  const archivalPolicies: RetentionPolicyItem[] = archival.checklist.archivalItems.map((item) =>
    policy(
      `arc-${item.id}`,
      item.label,
      "archival",
      true,
      item.required,
      item.description,
      item.href,
      item.apiHref,
    ),
  );

  const readonlyPolicies: RetentionPolicyItem[] = [
    policy("ro-archival-api", "Archival API readonly", "readonly", true, false, "Archival foundation JSON — GET only.", undefined, "/api/commercialization/archival"),
    policy("ro-retention-api", "Retention API readonly", "readonly", true, false, "Archive access JSON — GET only.", undefined, "/api/commercialization/archive-access"),
    policy("ro-release-ledger", "Release ledger readonly", "readonly", true, true, "Release ledger review surface.", "/dashboard/release-ledger", "/api/commercialization/release-ledger"),
    policy("ro-evidence", "Evidence export readonly", "readonly", true, false, "Static evidence export retention.", "/dashboard/evidence-export", "/api/commercialization/evidence-export"),
  ];

  const reviewPolicies: RetentionPolicyItem[] = [
    policy("rev-audit", "Audit retention review", "review", true, true, "Audit snapshot retention review.", "/dashboard/audit-review", "/api/commercialization/audit"),
    policy("rev-governance", "Governance retention review", "review", true, p.governanceArchived, "Governance archival retention review.", "/dashboard/governance-review"),
    policy("rev-release", "Release retention review", "review", true, p.releaseArchived, "Release ledger retention review.", "/dashboard/release-ledger"),
    policy("rev-ops", "Ops retention review", "review", true, p.opsArchived, "Ops portal retention review.", "/dashboard/ops", "/api/commercialization/ops-overview"),
  ];

  const allPolicies = [
    ...retentionPolicies,
    ...lifecyclePolicies,
    ...governancePolicies,
    ...archivalPolicies,
    ...readonlyPolicies,
    ...reviewPolicies,
  ];

  return {
    version: RETENTION_POLICY_VERSION,
    policyId,
    retentionPolicies,
    lifecyclePolicies,
    governancePolicies,
    archivalPolicies,
    readonlyPolicies,
    reviewPolicies,
    summary: `retention-policy id=${policyId} policies=${allPolicies.length} retention=${retentionPolicies.length} lifecycle=${lifecyclePolicies.length} governance=${governancePolicies.length} archival=${archivalPolicies.length}`,
  };
}
