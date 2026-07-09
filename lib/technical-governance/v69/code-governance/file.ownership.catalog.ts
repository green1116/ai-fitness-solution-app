/**
 * V69 P3 — File ownership catalog (declarative)
 */
import type { FileOwnershipEntry, FileOwnershipManifest } from "./governance.types";
import { V69_CODE_GOVERNANCE_VERSION } from "./governance.types";

export const FILE_OWNERSHIP_CATALOG: FileOwnershipEntry[] = [
  {
    id: "CGOV-FOWN-001",
    boundaryRef: "CGOV-BND-001",
    ownerRole: "frontend-lead",
    team: "application",
    contactGroup: "app-frontend",
    required: true,
    description: "app/ boundary owner",
  },
  {
    id: "CGOV-FOWN-002",
    boundaryRef: "CGOV-BND-002",
    ownerRole: "api-lead",
    team: "application",
    contactGroup: "app-api",
    required: true,
    description: "app/api/ boundary owner",
  },
  {
    id: "CGOV-FOWN-003",
    boundaryRef: "CGOV-BND-003",
    ownerRole: "domain-lead",
    team: "product-engineering",
    contactGroup: "domain-engines",
    required: true,
    description: "lib/ boundary owner",
  },
  {
    id: "CGOV-FOWN-004",
    boundaryRef: "CGOV-BND-004",
    ownerRole: "data-lead",
    team: "platform",
    contactGroup: "data-platform",
    required: true,
    description: "prisma/ boundary owner",
  },
  {
    id: "CGOV-FOWN-005",
    boundaryRef: "CGOV-BND-005",
    ownerRole: "release-lead",
    team: "platform",
    contactGroup: "deployment",
    required: true,
    description: "lib/deployment/ boundary owner",
  },
  {
    id: "CGOV-FOWN-006",
    boundaryRef: "CGOV-BND-006",
    ownerRole: "governance-lead",
    team: "platform",
    contactGroup: "platform-governance",
    required: true,
    description: "lib/platform/v68/ boundary owner",
  },
  {
    id: "CGOV-FOWN-007",
    boundaryRef: "CGOV-BND-007",
    ownerRole: "sre-lead",
    team: "reliability",
    contactGroup: "monitoring",
    required: true,
    description: "lib/monitoring/v67/ boundary owner",
  },
  {
    id: "CGOV-FOWN-008",
    boundaryRef: "CGOV-BND-008",
    ownerRole: "security-lead",
    team: "security",
    contactGroup: "security-rbac",
    required: true,
    description: "lib/auth/ boundary owner",
  },
];

export function buildFileOwnershipManifest(): FileOwnershipManifest {
  const ownerships = FILE_OWNERSHIP_CATALOG;
  const catalogComplete = ownerships.length >= 6;

  return {
    version: V69_CODE_GOVERNANCE_VERSION,
    ownershipCount: ownerships.length,
    catalogComplete,
    ownerships,
    summary: [
      `file-ownerships count=${ownerships.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getOwnershipByBoundaryRef(
  boundaryRef: string,
): FileOwnershipEntry | undefined {
  return FILE_OWNERSHIP_CATALOG.find((o) => o.boundaryRef === boundaryRef);
}
