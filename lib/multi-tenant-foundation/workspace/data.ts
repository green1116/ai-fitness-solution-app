import type { Workspace } from "../shared/types";

export const WORKSPACES: Workspace[] = [
  {
    workspaceId: "workspace-brand-life-fitness",
    organizationId: "org-brand-life-fitness",
    workspaceName: "Life Fitness Brand Workspace",
    workspaceType: "brand",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-brand-technogym",
    organizationId: "org-brand-technogym",
    workspaceName: "Technogym Brand Workspace",
    workspaceType: "brand",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-brand-matrix",
    organizationId: "org-brand-matrix",
    workspaceName: "Matrix Brand Workspace",
    workspaceType: "brand",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-life-fitness-cn",
    organizationId: "org-supplier-life-fitness-cn",
    workspaceName: "Life Fitness CN Supplier Workspace",
    workspaceType: "supplier",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-technogym-cn",
    organizationId: "org-supplier-technogym-cn",
    workspaceName: "Technogym CN Supplier Workspace",
    workspaceType: "supplier",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-matrix-cn",
    organizationId: "org-supplier-matrix-cn",
    workspaceName: "Matrix CN Supplier Workspace",
    workspaceType: "supplier",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-supplier-shuhua",
    organizationId: "org-supplier-shuhua",
    workspaceName: "Shuhua Supplier Workspace",
    workspaceType: "supplier",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-tender-owner-sh-gym",
    organizationId: "org-tender-owner-sh-gym",
    workspaceName: "Shanghai Commercial Gym Tender Workspace",
    workspaceType: "tender-owner",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-tender-owner-bj-hotel",
    organizationId: "org-tender-owner-bj-hotel",
    workspaceName: "Beijing Hotel Tender Workspace",
    workspaceType: "tender-owner",
    status: "active",
    mode: "multi-tenant",
  },
  {
    workspaceId: "workspace-tender-owner-gz-campus",
    organizationId: "org-tender-owner-gz-campus",
    workspaceName: "Guangzhou Campus Tender Workspace",
    workspaceType: "tender-owner",
    status: "active",
    mode: "multi-tenant",
  },
];

export function getAllWorkspaces(): Workspace[] {
  return [...WORKSPACES];
}

export function getWorkspaceById(workspaceId: string): Workspace | undefined {
  return WORKSPACES.find((ws) => ws.workspaceId === workspaceId);
}

export function getWorkspacesByOrganizationId(organizationId: string): Workspace[] {
  return WORKSPACES.filter((ws) => ws.organizationId === organizationId);
}
