/**
 * V3.7-H9 Production Access — access matrix DTO (static, no real auth)
 */

import { getOpsPortalConfig } from "../ops/ops-portal.config";
import { buildLedgerAccessPolicy } from "../ops/ledger-access-policy";

export const ACCESS_MATRIX_DTO_VERSION = "3.7-h9-matrix-dto-1" as const;

export type AccessRole = {
  id: string;
  label: string;
  description: string;
};

export type AccessResource = {
  id: string;
  label: string;
  href?: string;
  apiHref?: string;
};

export type AccessPermission = {
  roleId: string;
  resourceId: string;
  action: "view";
  granted: boolean;
};

export type AccessRule = {
  id: string;
  resourceId: string;
  reason: string;
};

export type AccessMatrixDto = {
  matrixVersion: typeof ACCESS_MATRIX_DTO_VERSION;
  roles: AccessRole[];
  resources: AccessResource[];
  permissions: AccessPermission[];
  defaultRole: string;
  denyRules: AccessRule[];
  allowRules: AccessRule[];
};

const STATIC_ROLES: AccessRole[] = [
  {
    id: "ops-viewer",
    label: "Ops Viewer",
    description: "Readonly dashboard and observability surfaces.",
  },
  {
    id: "release-reviewer",
    label: "Release Reviewer",
    description: "Release ledger and stabilization review access.",
  },
  {
    id: "audit-reviewer",
    label: "Audit Reviewer",
    description: "Audit review and evidence export access.",
  },
  {
    id: "enterprise-admin",
    label: "Enterprise Admin",
    description: "Full readonly portal access for enterprise ops.",
  },
];

const ROLE_RESOURCE_MAP: Record<string, string[]> = {
  "ops-viewer": ["dashboard", "commercial-ops"],
  "release-reviewer": ["dashboard", "release-ledger", "release-stabilization"],
  "audit-reviewer": ["dashboard", "audit-review", "evidence-export"],
  "enterprise-admin": [
    "dashboard",
    "commercial-ops",
    "release-ledger",
    "release-stabilization",
    "audit-review",
    "evidence-export",
  ],
};

function buildResources(): AccessResource[] {
  const config = getOpsPortalConfig();
  const entries = config.sections.flatMap((section) => section.entries);
  return entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    href: entry.href,
    apiHref: entry.apiHref,
  }));
}

function resourcePolicyFlags(policy: ReturnType<typeof buildLedgerAccessPolicy>): Record<string, boolean> {
  return {
    dashboard: policy.canViewDashboard,
    "commercial-ops": policy.canViewObservability,
    "release-ledger": policy.canViewReleaseLedger,
    "release-stabilization": policy.canViewDashboard || policy.canViewReleaseLedger,
    "audit-review": policy.canViewAuditReview,
    "evidence-export": policy.canViewEvidenceExport,
  };
}

export function buildAccessMatrixDto(input?: { deploymentId?: string }): AccessMatrixDto {
  const policy = buildLedgerAccessPolicy(input);
  const resources = buildResources();
  const flags = resourcePolicyFlags(policy);

  const permissions: AccessPermission[] = [];
  for (const role of STATIC_ROLES) {
    const allowedResources = ROLE_RESOURCE_MAP[role.id] ?? [];
    for (const resource of resources) {
      const roleAllowed = allowedResources.includes(resource.id);
      const policyAllowed = flags[resource.id] ?? false;
      permissions.push({
        roleId: role.id,
        resourceId: resource.id,
        action: "view",
        granted: roleAllowed && policyAllowed,
      });
    }
  }

  const denyRules: AccessRule[] = [];
  const allowRules: AccessRule[] = [];

  for (const resource of resources) {
    const policyAllowed = flags[resource.id] ?? false;
    if (policyAllowed) {
      allowRules.push({
        id: `allow-${resource.id}`,
        resourceId: resource.id,
        reason: `Static ops policy grants readonly view when baseline signals pass.`,
      });
    } else {
      denyRules.push({
        id: `deny-${resource.id}`,
        resourceId: resource.id,
        reason: `Static ops policy denies view — baseline not ready for ${resource.id}.`,
      });
    }
  }

  return {
    matrixVersion: ACCESS_MATRIX_DTO_VERSION,
    roles: STATIC_ROLES,
    resources,
    permissions,
    defaultRole: "ops-viewer",
    denyRules,
    allowRules,
  };
}
