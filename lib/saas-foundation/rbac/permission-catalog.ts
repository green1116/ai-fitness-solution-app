import type { SaasPermissionDefinition } from "../shared/types";

export const SAAS_PERMISSIONS: SaasPermissionDefinition[] = [
  { key: "quote:create", resource: "quote", action: "create", description: "Create commercial quotes" },
  { key: "quote:read", resource: "quote", action: "read", description: "Read commercial quotes" },
  { key: "approval:submit", resource: "approval", action: "submit", description: "Submit approval requests" },
  { key: "approval:approve", resource: "approval", action: "approve", description: "Approve or reject requests" },
  { key: "package:download", resource: "package", action: "download", description: "Download deliverable packages" },
  { key: "delivery:execute", resource: "delivery", action: "execute", description: "Execute delivery orchestration" },
  { key: "audit:read", resource: "audit", action: "read", description: "Read audit events" },
  { key: "release:publish", resource: "release", action: "publish", description: "Publish commercial releases" },
  { key: "workspace:manage", resource: "workspace", action: "manage", description: "Manage workspaces" },
  { key: "member:invite", resource: "member", action: "invite", description: "Invite workspace members" },
  { key: "member:remove", resource: "member", action: "remove", description: "Remove workspace members" },
  { key: "tenant:admin", resource: "tenant", action: "admin", description: "Administer tenant settings" },
  { key: "billing:read", resource: "billing", action: "read", description: "Read billing information" },
  { key: "subscription:read", resource: "subscription", action: "read", description: "Read subscription status" },
  {
    key: "supplier.catalog:read",
    resource: "supplier.catalog",
    action: "read",
    description: "Read supplier catalog",
  },
  {
    key: "manufacturer.brand:read",
    resource: "manufacturer.brand",
    action: "read",
    description: "Read manufacturer brand data",
  },
];

export function getPermissionByKey(key: string): SaasPermissionDefinition | undefined {
  return SAAS_PERMISSIONS.find((item) => item.key === key);
}
