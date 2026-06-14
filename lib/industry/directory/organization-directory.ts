import { getOrganizationById } from "../organization-registry";
import type { RegistryValidation } from "../shared/types";
import type { IndustryDirectoryType, OrganizationDirectoryEntry } from "./types";

export const ORGANIZATION_DIRECTORY: OrganizationDirectoryEntry[] = [
  {
    entryId: "ind-dir-brand-life-fitness",
    organizationId: "ind-org-brand-life-fitness",
    directoryType: "brand",
    displayName: "Life Fitness",
    status: "active",
    region: "East China",
    tags: ["premium", "commercial-gym", "cardio"],
    metadata: { entityRef: "brand-life-fitness", portalLayer: "v26-brand-portal" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-brand-technogym",
    organizationId: "ind-org-brand-technogym",
    directoryType: "brand",
    displayName: "Technogym",
    status: "active",
    region: "East China",
    tags: ["premium", "commercial-gym", "design-led"],
    metadata: { entityRef: "brand-technogym", portalLayer: "v26-brand-portal" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-brand-matrix",
    organizationId: "ind-org-brand-matrix",
    directoryType: "brand",
    displayName: "Matrix Fitness",
    status: "active",
    region: "North China",
    tags: ["mid-market", "commercial-gym"],
    metadata: { entityRef: "brand-matrix", portalLayer: "v26-brand-portal" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-supplier-lf-cn",
    organizationId: "ind-org-supplier-life-fitness-cn",
    directoryType: "supplier",
    displayName: "Life Fitness China Supplier",
    status: "active",
    region: "East China",
    tags: ["regional-supplier", "inventory", "service"],
    metadata: { entityRef: "supplier-life-fitness-cn", portalLayer: "v27-supplier-portal" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-supplier-tg-cn",
    organizationId: "ind-org-supplier-technogym-cn",
    directoryType: "supplier",
    displayName: "Technogym China Supplier",
    status: "active",
    region: "East China",
    tags: ["regional-supplier", "premium-service"],
    metadata: { entityRef: "supplier-technogym-cn", portalLayer: "v27-supplier-portal" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-buyer-sh-gym",
    organizationId: "ind-org-buyer-sh-gym",
    directoryType: "buyer",
    displayName: "Shanghai Commercial Gym Buyer",
    status: "active",
    region: "East China",
    tags: ["commercial-gym", "tender-buyer"],
    metadata: { entityRef: "tender-sh-commercial-gym-2025-001", portalLayer: "v28-tender-marketplace" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-buyer-bj-hotel",
    organizationId: "ind-org-buyer-bj-hotel",
    directoryType: "buyer",
    displayName: "Beijing Hotel Fitness Buyer",
    status: "active",
    region: "North China",
    tags: ["hotel", "tender-buyer"],
    metadata: { entityRef: "tender-bj-hotel-2025-002", portalLayer: "v28-tender-marketplace" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-consultant-fitness-advisory",
    organizationId: "ind-org-consultant-fitness-advisory",
    directoryType: "consultant",
    displayName: "Fitness Industry Advisory Group",
    status: "active",
    region: "East China",
    tags: ["consulting", "commercial-gym", "advisory"],
    metadata: { specialty: "commercial-gym", region: "East China" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-contractor-sh-fitout",
    organizationId: "ind-org-buyer-sh-gym",
    directoryType: "contractor",
    displayName: "Shanghai Gym Fit-out Contractor",
    status: "active",
    region: "East China",
    tags: ["fit-out", "installation", "contractor"],
    metadata: { contractorFor: "ind-org-buyer-sh-gym", scope: "gym-fit-out" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-contractor-bj-renovation",
    organizationId: "ind-org-buyer-bj-hotel",
    directoryType: "contractor",
    displayName: "Beijing Hotel Renovation Contractor",
    status: "active",
    region: "North China",
    tags: ["renovation", "hotel", "contractor"],
    metadata: { contractorFor: "ind-org-buyer-bj-hotel", scope: "hotel-fitness-renovation" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-manufacturer-lf-global",
    organizationId: "ind-org-brand-life-fitness",
    directoryType: "manufacturer",
    displayName: "Life Fitness Global Manufacturing",
    status: "active",
    region: "Global",
    tags: ["manufacturer", "cardio", "strength"],
    metadata: { manufacturingRegion: "US", brandRef: "brand-life-fitness" },
    mode: "industry-platform",
  },
  {
    entryId: "ind-dir-manufacturer-tg-italy",
    organizationId: "ind-org-brand-technogym",
    directoryType: "manufacturer",
    displayName: "Technogym Italy Manufacturing",
    status: "active",
    region: "Europe",
    tags: ["manufacturer", "design-led", "premium"],
    metadata: { manufacturingRegion: "Italy", brandRef: "brand-technogym" },
    mode: "industry-platform",
  },
];

export function getAllDirectoryEntries(): OrganizationDirectoryEntry[] {
  return [...ORGANIZATION_DIRECTORY];
}

export function getDirectoryEntryById(entryId: string): OrganizationDirectoryEntry | undefined {
  return ORGANIZATION_DIRECTORY.find((entry) => entry.entryId === entryId);
}

export function getDirectoryEntriesByType(
  directoryType: IndustryDirectoryType,
): OrganizationDirectoryEntry[] {
  return ORGANIZATION_DIRECTORY.filter((entry) => entry.directoryType === directoryType);
}

export function getDirectoryEntriesByOrganizationId(
  organizationId: string,
): OrganizationDirectoryEntry[] {
  return ORGANIZATION_DIRECTORY.filter((entry) => entry.organizationId === organizationId);
}

export function validateOrganizationDirectory(): RegistryValidation {
  const entries = getAllDirectoryEntries();
  const requiredTypes: IndustryDirectoryType[] = [
    "brand",
    "supplier",
    "buyer",
    "consultant",
    "contractor",
    "manufacturer",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    entries.some((entry) => entry.directoryType === type),
  );
  const orgLinksValid = entries.every(
    (entry) =>
      entry.entryId.length > 0 &&
      entry.displayName.length > 0 &&
      entry.region.length > 0 &&
      entry.tags.length > 0 &&
      getOrganizationById(entry.organizationId) !== undefined &&
      entry.status === "active" &&
      entry.mode === "industry-platform",
  );
  const uniqueEntryIds = new Set(entries.map((entry) => entry.entryId)).size;

  const valid =
    entries.length >= 12 && typeCoverage && orgLinksValid && uniqueEntryIds === entries.length;

  return {
    valid,
    count: entries.length,
    summary: `organization-directory count=${entries.length} types=${requiredTypes.filter((t) => entries.some((e) => e.directoryType === t)).length}/6 valid=${valid}`,
  };
}
