/**
 * V69 P1 — Architecture owner catalog (declarative)
 */
import type { ArchitectureOwnerEntry, ArchitectureOwnerManifest } from "./catalog.types";
import { V69_ARCHITECTURE_CATALOG_VERSION } from "./catalog.types";

export const ARCHITECTURE_OWNER_CATALOG: ArchitectureOwnerEntry[] = [
  {
    id: "ARC-OWN-001",
    architectureDefRef: "ARC-DEF-001",
    ownerRole: "frontend-lead",
    team: "application",
    contactGroup: "app-frontend",
    required: true,
    description: "Next.js application owner",
  },
  {
    id: "ARC-OWN-002",
    architectureDefRef: "ARC-DEF-002",
    ownerRole: "api-lead",
    team: "application",
    contactGroup: "app-api",
    required: true,
    description: "API orchestration owner",
  },
  {
    id: "ARC-OWN-003",
    architectureDefRef: "ARC-DEF-003",
    ownerRole: "domain-lead",
    team: "product-engineering",
    contactGroup: "domain-engines",
    required: true,
    description: "Domain engines owner",
  },
  {
    id: "ARC-OWN-004",
    architectureDefRef: "ARC-DEF-004",
    ownerRole: "data-lead",
    team: "platform",
    contactGroup: "data-platform",
    required: true,
    description: "Prisma data access owner",
  },
  {
    id: "ARC-OWN-005",
    architectureDefRef: "ARC-DEF-005",
    ownerRole: "release-lead",
    team: "platform",
    contactGroup: "deployment",
    required: true,
    description: "Deployment pipeline owner",
  },
  {
    id: "ARC-OWN-006",
    architectureDefRef: "ARC-DEF-006",
    ownerRole: "governance-lead",
    team: "platform",
    contactGroup: "platform-governance",
    required: true,
    description: "Platform governance owner",
  },
  {
    id: "ARC-OWN-007",
    architectureDefRef: "ARC-DEF-007",
    ownerRole: "sre-lead",
    team: "reliability",
    contactGroup: "monitoring",
    required: true,
    description: "Monitoring observability owner",
  },
  {
    id: "ARC-OWN-008",
    architectureDefRef: "ARC-DEF-008",
    ownerRole: "security-lead",
    team: "security",
    contactGroup: "security-rbac",
    required: true,
    description: "Security RBAC owner",
  },
];

export function buildArchitectureOwnerManifest(): ArchitectureOwnerManifest {
  const owners = ARCHITECTURE_OWNER_CATALOG;
  const catalogComplete = owners.length >= 6;

  return {
    version: V69_ARCHITECTURE_CATALOG_VERSION,
    entryCount: owners.length,
    catalogComplete,
    owners,
    summary: [
      `architecture-owners count=${owners.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getOwnerByArchitectureDefRef(
  architectureDefRef: string,
): ArchitectureOwnerEntry | undefined {
  return ARCHITECTURE_OWNER_CATALOG.find((o) => o.architectureDefRef === architectureDefRef);
}
