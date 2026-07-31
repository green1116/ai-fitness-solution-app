/**
 * PI-4.1 — Existing persistence model registry (PD-5.4 §5).
 * Reuses Prisma / FS models already in the product — no new schemas.
 */
import type { ProductDomainId } from "../../backend/foundation/domain-ownership";
import type { DataClassId } from "./data-ownership";
import type { RepositoryId } from "./repository-catalogue";
import type { StorageFamilyId } from "./storage-families";

export type PersistenceModelKind = "prisma" | "filesystem" | "in-process";

export type PersistenceModelRow = Readonly<{
  modelId: string;
  kind: PersistenceModelKind;
  /** Existing declaration path (schema file or module). */
  declarationPath: string;
  ownerDomain: ProductDomainId;
  dataClassId: DataClassId;
  repositoryId: RepositoryId;
  storageFamily: StorageFamilyId;
  notes: string;
}>;

/**
 * Closed inventory of existing durable models reused by PI-4.1.
 * Does not invent tables or relocate schemas.
 */
export const PERSISTENCE_MODEL_REGISTRY = [
  {
    modelId: "Tender",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M11",
    dataClassId: "DATA-KNOWLEDGE",
    repositoryId: "REPO-KNOWLEDGE",
    storageFamily: "STF-RELATIONAL",
    notes: "Tender / knowledge intake records",
  },
  {
    modelId: "Quote",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M11",
    dataClassId: "DATA-KNOWLEDGE",
    repositoryId: "REPO-KNOWLEDGE",
    storageFamily: "STF-RELATIONAL",
    notes: "Quote / tender response knowledge",
  },
  {
    modelId: "Solution",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M14",
    dataClassId: "DATA-INTELLIGENCE",
    repositoryId: "REPO-INTELLIGENCE",
    storageFamily: "STF-RELATIONAL",
    notes: "Solution analysis outcome (M14); knowledge refs via M11",
  },
  {
    modelId: "DocumentExport",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M11",
    dataClassId: "DATA-ARTIFACT-BYTES",
    repositoryId: "REPO-ARTIFACT",
    storageFamily: "STF-RELATIONAL",
    notes: "Artifact metadata; bytes via object/FS paths",
  },
  {
    modelId: "PlanStorage",
    kind: "filesystem",
    declarationPath: "lib/storage/plan-storage.ts",
    ownerDomain: "M11",
    dataClassId: "DATA-ARTIFACT-BYTES",
    repositoryId: "REPO-ARTIFACT",
    storageFamily: "STF-OBJECT",
    notes: "Existing plans/<id> artifact bytes",
  },
  {
    modelId: "PlanJob",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M12",
    dataClassId: "DATA-AGENT-RUN",
    repositoryId: "REPO-AGENT-RUN",
    storageFamily: "STF-JOB",
    notes: "Agent / plan job run state",
  },
  {
    modelId: "V80ScaffoldPlanJob",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M12",
    dataClassId: "DATA-AGENT-RUN",
    repositoryId: "REPO-AGENT-RUN",
    storageFamily: "STF-JOB",
    notes: "v80 scaffold job store (existing)",
  },
  {
    modelId: "Project",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M13",
    dataClassId: "DATA-OS-PLATFORM",
    repositoryId: "REPO-PROJECT",
    storageFamily: "STF-RELATIONAL",
    notes: "Project OS platform entity",
  },
  {
    modelId: "User",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M13",
    dataClassId: "DATA-OS-PLATFORM",
    repositoryId: "REPO-TENANT-USER",
    storageFamily: "STF-RELATIONAL",
    notes: "User identity",
  },
  {
    modelId: "Organization",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M13",
    dataClassId: "DATA-OS-PLATFORM",
    repositoryId: "REPO-TENANT-USER",
    storageFamily: "STF-RELATIONAL",
    notes: "Tenant / organization",
  },
  {
    modelId: "OrganizationMember",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M13",
    dataClassId: "DATA-OS-PLATFORM",
    repositoryId: "REPO-TENANT-USER",
    storageFamily: "STF-RELATIONAL",
    notes: "Org membership",
  },
  {
    modelId: "Session",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M13",
    dataClassId: "DATA-SESSION",
    repositoryId: "REPO-SESSION",
    storageFamily: "STF-SESSION",
    notes: "Auth session SoT",
  },
  {
    modelId: "EmailOtp",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M13",
    dataClassId: "DATA-SESSION",
    repositoryId: "REPO-SESSION",
    storageFamily: "STF-SESSION",
    notes: "OTP credential surface",
  },
  {
    modelId: "Budget",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M14",
    dataClassId: "DATA-INTELLIGENCE",
    repositoryId: "REPO-INTELLIGENCE",
    storageFamily: "STF-RELATIONAL",
    notes: "Budget analysis outcome",
  },
  {
    modelId: "Opportunity",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M14",
    dataClassId: "DATA-INTELLIGENCE",
    repositoryId: "REPO-INTELLIGENCE",
    storageFamily: "STF-RELATIONAL",
    notes: "Sales opportunity signal",
  },
  {
    modelId: "Lead",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M14",
    dataClassId: "DATA-INTELLIGENCE",
    repositoryId: "REPO-INTELLIGENCE",
    storageFamily: "STF-RELATIONAL",
    notes: "CRM lead / opportunity funnel",
  },
  {
    modelId: "PdfDownloadLog",
    kind: "prisma",
    declarationPath: "prisma/schema.prisma",
    ownerDomain: "M13",
    dataClassId: "DATA-OPS",
    repositoryId: "REPO-OPS-AUDIT",
    storageFamily: "STF-AUDIT",
    notes: "Download / ops audit trail",
  },
  {
    modelId: "M15FeedbackRegistry",
    kind: "in-process",
    declarationPath: "lib/product/m15/feedback",
    ownerDomain: "M15",
    dataClassId: "DATA-EVOLUTION",
    repositoryId: "REPO-EVOLUTION",
    storageFamily: "STF-RELATIONAL",
    notes: "Existing Evolution feedback registry (no new schema)",
  },
  {
    modelId: "GovernancePersistence",
    kind: "in-process",
    declarationPath: "lib/operations/governance",
    ownerDomain: "M15",
    dataClassId: "DATA-EVOLUTION",
    repositoryId: "REPO-EVOLUTION",
    storageFamily: "STF-AUDIT",
    notes: "Existing governance persistence surfaces",
  },
  {
    modelId: "PrismaClientEntry",
    kind: "prisma",
    declarationPath: "lib/prisma.ts",
    ownerDomain: "M13",
    dataClassId: "DATA-OS-PLATFORM",
    repositoryId: "REPO-PROJECT",
    storageFamily: "STF-RELATIONAL",
    notes: "Existing Prisma client entry (shared engine; ownership via models)",
  },
] as const satisfies readonly PersistenceModelRow[];

export function modelsForRepository(
  repositoryId: RepositoryId,
): PersistenceModelRow[] {
  return PERSISTENCE_MODEL_REGISTRY.filter(
    (row) => row.repositoryId === repositoryId,
  );
}

export function modelsForDomain(
  domainId: ProductDomainId,
): PersistenceModelRow[] {
  return PERSISTENCE_MODEL_REGISTRY.filter(
    (row) => row.ownerDomain === domainId,
  );
}
