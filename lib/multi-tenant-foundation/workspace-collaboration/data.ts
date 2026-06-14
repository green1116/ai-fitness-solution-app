import type { WorkspaceCollaboration } from "../shared/types";

export const WORKSPACE_COLLABORATIONS: WorkspaceCollaboration[] = [
  {
    workspaceId: "workspace-brand-life-fitness",
    organizationId: "org-brand-life-fitness",
    resourceType: "brand.profile",
    resourceId: "brand-life-fitness",
    permissionLevel: "admin",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-brand-life-fitness",
    organizationId: "org-brand-life-fitness",
    resourceType: "brand.product",
    resourceId: "brand-life-fitness",
    permissionLevel: "write",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-brand-technogym",
    organizationId: "org-brand-technogym",
    resourceType: "brand.profile",
    resourceId: "brand-technogym",
    permissionLevel: "admin",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-brand-matrix",
    organizationId: "org-brand-matrix",
    resourceType: "brand.product",
    resourceId: "brand-matrix",
    permissionLevel: "write",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-life-fitness-cn",
    organizationId: "org-supplier-life-fitness-cn",
    resourceType: "supplier.inventory",
    resourceId: "supplier-life-fitness-cn",
    permissionLevel: "write",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-life-fitness-cn",
    organizationId: "org-supplier-life-fitness-cn",
    resourceType: "supplier.pricing",
    resourceId: "supplier-life-fitness-cn",
    permissionLevel: "admin",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-technogym-cn",
    organizationId: "org-supplier-technogym-cn",
    resourceType: "supplier.inventory",
    resourceId: "supplier-technogym-cn",
    permissionLevel: "write",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-matrix-cn",
    organizationId: "org-supplier-matrix-cn",
    resourceType: "supplier.pricing",
    resourceId: "supplier-matrix-cn",
    permissionLevel: "write",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-shuhua",
    organizationId: "org-supplier-shuhua",
    resourceType: "supplier.inventory",
    resourceId: "supplier-shuhua",
    permissionLevel: "read",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-tender-owner-sh-gym",
    organizationId: "org-tender-owner-sh-gym",
    resourceType: "tender.tender",
    resourceId: "tender-sh-commercial-gym-2025-001",
    permissionLevel: "admin",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-tender-owner-bj-hotel",
    organizationId: "org-tender-owner-bj-hotel",
    resourceType: "tender.tender",
    resourceId: "tender-bj-hotel-2025-002",
    permissionLevel: "write",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-tender-owner-gz-campus",
    organizationId: "org-tender-owner-gz-campus",
    resourceType: "tender.tender",
    resourceId: "tender-gz-campus-2025-004",
    permissionLevel: "write",
    mode: "multi-tenant",
  },
];

export function getAllWorkspaceCollaborations(): WorkspaceCollaboration[] {
  return [...WORKSPACE_COLLABORATIONS];
}

export function getWorkspaceCollaborationsByWorkspaceId(
  workspaceId: string,
): WorkspaceCollaboration[] {
  return WORKSPACE_COLLABORATIONS.filter((entry) => entry.workspaceId === workspaceId);
}
