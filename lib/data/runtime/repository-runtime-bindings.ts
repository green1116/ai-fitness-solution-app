/**
 * PI-4.3 — Repository → persistence runtime adapter map.
 * Aligns with PI-4.2 access bindings; reuses PI-4.1 storage families.
 */
import type { RepositoryId } from "../foundation/repository-catalogue";
import type { StorageFamilyId } from "../foundation/storage-families";

export type RepositoryRuntimeBinding = Readonly<{
  repositoryId: RepositoryId;
  /** Preferred SoT runtime adapters (existing engines only). */
  adapterIds: readonly string[];
  primaryStorageFamily: StorageFamilyId;
  notes: string;
}>;

/**
 * Closed REPO-* → PRT-* map (9 repos; no new families).
 */
export const REPOSITORY_RUNTIME_BINDINGS = [
  {
    repositoryId: "REPO-KNOWLEDGE",
    adapterIds: ["PRT-PRISMA"],
    primaryStorageFamily: "STF-RELATIONAL",
    notes: "Tender/quote relational SoT",
  },
  {
    repositoryId: "REPO-ARTIFACT",
    adapterIds: ["PRT-OBJECT-FS", "PRT-PRISMA"],
    primaryStorageFamily: "STF-OBJECT",
    notes: "Artifact bytes + export metadata",
  },
  {
    repositoryId: "REPO-AGENT-RUN",
    adapterIds: ["PRT-V80-JOB", "PRT-PRISMA"],
    primaryStorageFamily: "STF-JOB",
    notes: "Job run state via v80 + Prisma",
  },
  {
    repositoryId: "REPO-PROJECT",
    adapterIds: ["PRT-PRISMA"],
    primaryStorageFamily: "STF-RELATIONAL",
    notes: "Project platform rows",
  },
  {
    repositoryId: "REPO-TENANT-USER",
    adapterIds: ["PRT-PRISMA"],
    primaryStorageFamily: "STF-RELATIONAL",
    notes: "Tenant/user relational SoT",
  },
  {
    repositoryId: "REPO-SESSION",
    adapterIds: ["PRT-SESSION", "PRT-PRISMA"],
    primaryStorageFamily: "STF-SESSION",
    notes: "Session credential store",
  },
  {
    repositoryId: "REPO-INTELLIGENCE",
    adapterIds: ["PRT-PRISMA"],
    primaryStorageFamily: "STF-RELATIONAL",
    notes: "Budget/opportunity relational SoT",
  },
  {
    repositoryId: "REPO-EVOLUTION",
    adapterIds: ["PRT-AUDIT-GOV", "PRT-PRISMA"],
    primaryStorageFamily: "STF-AUDIT",
    notes: "Evolution governance / feedback surfaces",
  },
  {
    repositoryId: "REPO-OPS-AUDIT",
    adapterIds: ["PRT-AUDIT-GOV", "PRT-PRISMA"],
    primaryStorageFamily: "STF-AUDIT",
    notes: "Ops audit trail",
  },
] as const satisfies readonly RepositoryRuntimeBinding[];

export function getRepositoryRuntimeBinding(
  repositoryId: RepositoryId,
): RepositoryRuntimeBinding | undefined {
  return REPOSITORY_RUNTIME_BINDINGS.find(
    (row) => row.repositoryId === repositoryId,
  );
}
