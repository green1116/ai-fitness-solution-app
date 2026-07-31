/**
 * PI-4.1 — Logical repository / persistence port catalogue (PD-5.4 §4).
 * Ports map to existing modules — no new repositories or Domains.
 */
import type { ProductDomainId } from "../../backend/foundation/domain-ownership";
import type { DataClassId } from "./data-ownership";
import type { StorageFamilyId } from "./storage-families";

export const REPOSITORY_IDS = [
  "REPO-KNOWLEDGE",
  "REPO-ARTIFACT",
  "REPO-AGENT-RUN",
  "REPO-PROJECT",
  "REPO-TENANT-USER",
  "REPO-SESSION",
  "REPO-INTELLIGENCE",
  "REPO-EVOLUTION",
  "REPO-OPS-AUDIT",
] as const;

export type RepositoryId = (typeof REPOSITORY_IDS)[number];

export type RepositoryCatalogueRow = Readonly<{
  repositoryId: RepositoryId;
  ownerDomain: ProductDomainId;
  storageFamilies: readonly StorageFamilyId[];
  dataClasses: readonly DataClassId[];
  serves: string;
  /** Existing module paths that already implement access (not new code). */
  existingModulePaths: readonly string[];
}>;

/**
 * PD-5.4 §4.2 logical repos bound to existing access modules.
 */
export const REPOSITORY_CATALOGUE = [
  {
    repositoryId: "REPO-KNOWLEDGE",
    ownerDomain: "M11",
    storageFamilies: ["STF-RELATIONAL", "STF-DOCUMENT"],
    dataClasses: ["DATA-KNOWLEDGE"],
    serves: "Intake, requirements, catalog",
    existingModulePaths: [
      "lib/services/tender.service.ts",
      "lib/services/quote.service.ts",
      "lib/portal/v58/documents/documents.aggregator.ts",
      "prisma/schema.prisma",
    ],
  },
  {
    repositoryId: "REPO-ARTIFACT",
    ownerDomain: "M11",
    storageFamilies: ["STF-OBJECT", "STF-RELATIONAL"],
    dataClasses: ["DATA-ARTIFACT-BYTES", "DATA-KNOWLEDGE"],
    serves: "Upload/export bytes",
    existingModulePaths: [
      "lib/storage/plan-storage.ts",
      "lib/scaffold/v80/pdf/artifact.service.ts",
      "lib/audit/pdfLog.ts",
      "prisma/schema.prisma",
    ],
  },
  {
    repositoryId: "REPO-AGENT-RUN",
    ownerDomain: "M12",
    storageFamilies: ["STF-JOB"],
    dataClasses: ["DATA-AGENT-RUN"],
    serves: "Generate / workspace jobs",
    existingModulePaths: [
      "lib/scaffold/v80/routes/autopilot-job.route.ts",
      "lib/scaffold/v80/runtime/prisma.backend.ts",
      "lib/services/tender/provisionProjectFromPlan.ts",
      "prisma/schema.prisma",
    ],
  },
  {
    repositoryId: "REPO-PROJECT",
    ownerDomain: "M13",
    storageFamilies: ["STF-RELATIONAL"],
    dataClasses: ["DATA-OS-PLATFORM"],
    serves: "Project list/detail",
    existingModulePaths: [
      "lib/services/project.service.ts",
      "prisma/schema.prisma",
    ],
  },
  {
    repositoryId: "REPO-TENANT-USER",
    ownerDomain: "M13",
    storageFamilies: ["STF-RELATIONAL"],
    dataClasses: ["DATA-OS-PLATFORM", "DATA-OPS"],
    serves: "Tenant/user/ops configs",
    existingModulePaths: [
      "lib/auth/user.service.ts",
      "lib/organization",
      "lib/scaffold/v80/services/tenant.service.ts",
      "prisma/schema.prisma",
    ],
  },
  {
    repositoryId: "REPO-SESSION",
    ownerDomain: "M13",
    storageFamilies: ["STF-SESSION"],
    dataClasses: ["DATA-SESSION"],
    serves: "Auth sessions",
    existingModulePaths: [
      "lib/session.ts",
      "lib/auth/session.service.ts",
      "prisma/schema.prisma",
    ],
  },
  {
    repositoryId: "REPO-INTELLIGENCE",
    ownerDomain: "M14",
    storageFamilies: ["STF-RELATIONAL", "STF-DOCUMENT"],
    dataClasses: ["DATA-INTELLIGENCE"],
    serves: "Analyses, opportunities",
    existingModulePaths: [
      "lib/services/budget.service.ts",
      "lib/crm",
      "prisma/schema.prisma",
    ],
  },
  {
    repositoryId: "REPO-EVOLUTION",
    ownerDomain: "M15",
    storageFamilies: ["STF-RELATIONAL", "STF-AUDIT"],
    dataClasses: ["DATA-EVOLUTION"],
    serves: "Share, feedback, governance",
    existingModulePaths: [
      "lib/product/m15/feedback",
      "lib/operations/governance",
      "lib/download-token.ts",
    ],
  },
  {
    repositoryId: "REPO-OPS-AUDIT",
    ownerDomain: "M13",
    storageFamilies: ["STF-AUDIT", "STF-RELATIONAL"],
    dataClasses: ["DATA-OPS", "DATA-EVOLUTION"],
    serves: "Ops governance surfaces",
    existingModulePaths: [
      "lib/audit/pdfLog.ts",
      "lib/operations/governance",
      "lib/prisma-stability/audit",
      "prisma/schema.prisma",
    ],
  },
] as const satisfies readonly RepositoryCatalogueRow[];

export function getRepository(
  repositoryId: RepositoryId,
): RepositoryCatalogueRow | undefined {
  return REPOSITORY_CATALOGUE.find((row) => row.repositoryId === repositoryId);
}

export function repositoriesForDomain(
  domainId: ProductDomainId,
): RepositoryCatalogueRow[] {
  return REPOSITORY_CATALOGUE.filter((row) => row.ownerDomain === domainId);
}
