import type { Organization } from "../shared/types";

export const ORGANIZATIONS: Organization[] = [
  {
    organizationId: "org-brand-life-fitness",
    organizationName: "Life Fitness Brand Organization",
    organizationType: "brand",
    entityRef: "brand-life-fitness",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-brand-technogym",
    organizationName: "Technogym Brand Organization",
    organizationType: "brand",
    entityRef: "brand-technogym",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-brand-matrix",
    organizationName: "Matrix Brand Organization",
    organizationType: "brand",
    entityRef: "brand-matrix",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-supplier-life-fitness-cn",
    organizationName: "Life Fitness CN Supplier Organization",
    organizationType: "supplier",
    entityRef: "supplier-life-fitness-cn",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-supplier-technogym-cn",
    organizationName: "Technogym CN Supplier Organization",
    organizationType: "supplier",
    entityRef: "supplier-technogym-cn",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-supplier-matrix-cn",
    organizationName: "Matrix CN Supplier Organization",
    organizationType: "supplier",
    entityRef: "supplier-matrix-cn",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-supplier-shuhua",
    organizationName: "Shuhua Supplier Organization",
    organizationType: "supplier",
    entityRef: "supplier-shuhua",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-tender-owner-sh-gym",
    organizationName: "Shanghai Commercial Gym Tender Owner",
    organizationType: "tender-owner",
    entityRef: "tender-sh-commercial-gym-2025-001",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-tender-owner-bj-hotel",
    organizationName: "Beijing Hotel Tender Owner",
    organizationType: "tender-owner",
    entityRef: "tender-bj-hotel-2025-002",
    status: "active",
    mode: "multi-tenant",
  },
  {
    organizationId: "org-tender-owner-gz-campus",
    organizationName: "Guangzhou Campus Tender Owner",
    organizationType: "tender-owner",
    entityRef: "tender-gz-campus-2025-004",
    status: "active",
    mode: "multi-tenant",
  },
];

export function getAllOrganizations(): Organization[] {
  return [...ORGANIZATIONS];
}

export function getOrganizationById(organizationId: string): Organization | undefined {
  return ORGANIZATIONS.find((org) => org.organizationId === organizationId);
}

export function getOrganizationsByType(
  organizationType: Organization["organizationType"],
): Organization[] {
  return ORGANIZATIONS.filter((org) => org.organizationType === organizationType);
}
