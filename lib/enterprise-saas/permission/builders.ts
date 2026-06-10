import type { RoleKind } from "../role/types";
import type { PermissionDomain, PermissionGrant, PermissionLevel } from "./types";

export const PERMISSION_DOMAINS: PermissionDomain[] = [
  "plan-access",
  "budget-access",
  "tender-access",
  "billing-access",
  "admin-access",
];

const DOMAIN_LABELS: Record<PermissionDomain, string> = {
  "plan-access": "Plan Access",
  "budget-access": "Budget Access",
  "tender-access": "Tender Access",
  "billing-access": "Billing Access",
  "admin-access": "Admin Access",
};

const ROLE_PERMISSIONS: Record<RoleKind, Record<PermissionDomain, PermissionLevel>> = {
  owner: {
    "plan-access": "full",
    "budget-access": "full",
    "tender-access": "full",
    "billing-access": "full",
    "admin-access": "full",
  },
  admin: {
    "plan-access": "full",
    "budget-access": "full",
    "tender-access": "full",
    "billing-access": "read",
    "admin-access": "write",
  },
  manager: {
    "plan-access": "write",
    "budget-access": "write",
    "tender-access": "write",
    "billing-access": "none",
    "admin-access": "none",
  },
  member: {
    "plan-access": "write",
    "budget-access": "write",
    "tender-access": "read",
    "billing-access": "none",
    "admin-access": "none",
  },
  viewer: {
    "plan-access": "read",
    "budget-access": "read",
    "tender-access": "read",
    "billing-access": "none",
    "admin-access": "none",
  },
};

export function buildPermissionGrants(input?: {
  deploymentId?: string;
}): PermissionGrant[] {
  const deploymentId = input?.deploymentId ?? "permission-default";
  const roles: RoleKind[] = ["owner", "admin", "manager", "member", "viewer"];
  const grants: PermissionGrant[] = [];

  for (const roleKind of roles) {
    for (const domain of PERMISSION_DOMAINS) {
      const level = ROLE_PERMISSIONS[roleKind][domain];
      grants.push({
        grantId: `grant-${roleKind}-${domain}-${deploymentId}`,
        domain,
        roleKind,
        level,
        description: `${roleKind} → ${DOMAIN_LABELS[domain]}: ${level}`,
      });
    }
  }

  return grants;
}
