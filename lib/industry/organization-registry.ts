import type { IndustryOrganizationType, Organization, RegistryValidation } from "./shared/types";

export const ORGANIZATION_REGISTRY: Organization[] = [
  {
    organizationId: "ind-org-brand-life-fitness",
    organizationType: "brand",
    organizationName: "Life Fitness Brand Organization",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    metadata: { entityRef: "brand-life-fitness", portalLayer: "v26-brand-portal" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-brand-technogym",
    organizationType: "brand",
    organizationName: "Technogym Brand Organization",
    status: "active",
    createdAt: "2026-01-02T00:00:00.000Z",
    metadata: { entityRef: "brand-technogym", portalLayer: "v26-brand-portal" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-supplier-life-fitness-cn",
    organizationType: "supplier",
    organizationName: "Life Fitness CN Supplier Organization",
    status: "active",
    createdAt: "2026-01-03T00:00:00.000Z",
    metadata: { entityRef: "supplier-life-fitness-cn", portalLayer: "v27-supplier-portal" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-supplier-technogym-cn",
    organizationType: "supplier",
    organizationName: "Technogym CN Supplier Organization",
    status: "active",
    createdAt: "2026-01-04T00:00:00.000Z",
    metadata: { entityRef: "supplier-technogym-cn", portalLayer: "v27-supplier-portal" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-buyer-sh-gym",
    organizationType: "buyer",
    organizationName: "Shanghai Commercial Gym Buyer Organization",
    status: "active",
    createdAt: "2026-01-05T00:00:00.000Z",
    metadata: { entityRef: "tender-sh-commercial-gym-2025-001", portalLayer: "v28-tender-marketplace" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-buyer-bj-hotel",
    organizationType: "buyer",
    organizationName: "Beijing Hotel Buyer Organization",
    status: "active",
    createdAt: "2026-01-06T00:00:00.000Z",
    metadata: { entityRef: "tender-bj-hotel-2025-002", portalLayer: "v28-tender-marketplace" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-consultant-fitness-advisory",
    organizationType: "consultant",
    organizationName: "Fitness Industry Advisory Group",
    status: "active",
    createdAt: "2026-01-07T00:00:00.000Z",
    metadata: { specialty: "commercial-gym", region: "East China" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-operator-platform-ops",
    organizationType: "operator",
    organizationName: "Industry Platform Operations Center",
    status: "active",
    createdAt: "2026-01-08T00:00:00.000Z",
    metadata: { scope: "platform-operations", tier: "national" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-association-china-fitness",
    organizationType: "association",
    organizationName: "China Commercial Fitness Equipment Association",
    status: "active",
    createdAt: "2026-01-09T00:00:00.000Z",
    metadata: { region: "national", category: "industry-association" },
    mode: "industry-platform",
  },
  {
    organizationId: "ind-org-brand-matrix",
    organizationType: "brand",
    organizationName: "Matrix Brand Organization",
    status: "active",
    createdAt: "2026-01-10T00:00:00.000Z",
    metadata: { entityRef: "brand-matrix", portalLayer: "v26-brand-portal" },
    mode: "industry-platform",
  },
];

export function getAllOrganizations(): Organization[] {
  return [...ORGANIZATION_REGISTRY];
}

export function getOrganizationById(organizationId: string): Organization | undefined {
  return ORGANIZATION_REGISTRY.find((org) => org.organizationId === organizationId);
}

export function getOrganizationsByType(
  organizationType: IndustryOrganizationType,
): Organization[] {
  return ORGANIZATION_REGISTRY.filter((org) => org.organizationType === organizationType);
}

export function validateOrganizationRegistry(): RegistryValidation {
  const organizations = getAllOrganizations();
  const requiredTypes: IndustryOrganizationType[] = [
    "brand",
    "supplier",
    "buyer",
    "consultant",
    "operator",
    "association",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    organizations.some((org) => org.organizationType === type),
  );
  const fieldValid = organizations.every(
    (org) =>
      org.organizationId.length > 0 &&
      org.organizationName.length > 0 &&
      org.createdAt.length > 0 &&
      org.status === "active" &&
      org.mode === "industry-platform",
  );

  const valid = organizations.length >= 10 && typeCoverage && fieldValid;

  return {
    valid,
    count: organizations.length,
    summary: `organization-registry count=${organizations.length} types=${requiredTypes.filter((t) => organizations.some((o) => o.organizationType === t)).length}/6 valid=${valid}`,
  };
}
