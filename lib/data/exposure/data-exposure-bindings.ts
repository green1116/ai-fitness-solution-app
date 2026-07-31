/**
 * PI-4.4 — Data exposure bindings for existing REPO-* / runtime (PD-5.4 §6).
 * Exposes Domain persistence outcomes via existing ports — no new families.
 */
import type { DataClassId } from "../foundation/data-ownership";
import type { RepositoryId } from "../foundation/repository-catalogue";
import type { StorageFamilyId } from "../foundation/storage-families";

/**
 * How durable data is exposed from L1 ports (not HTTP API families).
 */
export type DataExposureMode =
  | "query-read"
  | "command-write"
  | "artifact-stream"
  | "session-observe"
  | "job-progress"
  | "audit-append";

export type DataExposureBinding = Readonly<{
  repositoryId: RepositoryId;
  modes: readonly DataExposureMode[];
  dataClasses: readonly DataClassId[];
  primaryStorageFamily: StorageFamilyId;
  /** Existing access module reused as exposure surface (from PI-4.2). */
  exposureModule: string;
  notes: string;
}>;

/**
 * Closed 9-row exposure map aligned with PI-4.1/4.2/4.3.
 */
export const DATA_EXPOSURE_BINDINGS = [
  {
    repositoryId: "REPO-KNOWLEDGE",
    modes: ["query-read", "command-write"],
    dataClasses: ["DATA-KNOWLEDGE"],
    primaryStorageFamily: "STF-RELATIONAL",
    exposureModule: "lib/services/tender.service.ts",
    notes: "Knowledge read/write via existing tender service",
  },
  {
    repositoryId: "REPO-ARTIFACT",
    modes: ["query-read", "command-write", "artifact-stream"],
    dataClasses: ["DATA-ARTIFACT-BYTES", "DATA-KNOWLEDGE"],
    primaryStorageFamily: "STF-OBJECT",
    exposureModule: "lib/storage/plan-storage.ts",
    notes: "Artifact metadata + byte stream (RW-04)",
  },
  {
    repositoryId: "REPO-AGENT-RUN",
    modes: ["query-read", "command-write", "job-progress"],
    dataClasses: ["DATA-AGENT-RUN"],
    primaryStorageFamily: "STF-JOB",
    exposureModule: "lib/scaffold/v80/runtime/prisma.backend.ts",
    notes: "Agent job progress / run state",
  },
  {
    repositoryId: "REPO-PROJECT",
    modes: ["query-read", "command-write"],
    dataClasses: ["DATA-OS-PLATFORM"],
    primaryStorageFamily: "STF-RELATIONAL",
    exposureModule: "lib/services/project.service.ts",
    notes: "Project platform exposure",
  },
  {
    repositoryId: "REPO-TENANT-USER",
    modes: ["query-read", "command-write"],
    dataClasses: ["DATA-OS-PLATFORM", "DATA-OPS"],
    primaryStorageFamily: "STF-RELATIONAL",
    exposureModule: "lib/auth/user.service.ts",
    notes: "Tenant/user exposure",
  },
  {
    repositoryId: "REPO-SESSION",
    modes: ["query-read", "command-write", "session-observe"],
    dataClasses: ["DATA-SESSION"],
    primaryStorageFamily: "STF-SESSION",
    exposureModule: "lib/session.ts",
    notes: "Session observe / credential durability",
  },
  {
    repositoryId: "REPO-INTELLIGENCE",
    modes: ["query-read", "command-write"],
    dataClasses: ["DATA-INTELLIGENCE"],
    primaryStorageFamily: "STF-RELATIONAL",
    exposureModule: "lib/services/budget.service.ts",
    notes: "Intelligence analysis outcomes",
  },
  {
    repositoryId: "REPO-EVOLUTION",
    modes: ["query-read", "command-write", "audit-append"],
    dataClasses: ["DATA-EVOLUTION"],
    primaryStorageFamily: "STF-AUDIT",
    exposureModule: "lib/product/m15/feedback",
    notes: "Evolution share/feedback/governance signals",
  },
  {
    repositoryId: "REPO-OPS-AUDIT",
    modes: ["query-read", "command-write", "audit-append"],
    dataClasses: ["DATA-OPS", "DATA-EVOLUTION"],
    primaryStorageFamily: "STF-AUDIT",
    exposureModule: "lib/audit/pdfLog.ts",
    notes: "Ops audit append / read",
  },
] as const satisfies readonly DataExposureBinding[];

export function getDataExposureBinding(
  repositoryId: RepositoryId,
): DataExposureBinding | undefined {
  return DATA_EXPOSURE_BINDINGS.find(
    (row) => row.repositoryId === repositoryId,
  );
}

export function exposureSupportsQuery(modes: readonly DataExposureMode[]): boolean {
  return modes.includes("query-read") || modes.includes("session-observe");
}

export function exposureSupportsCommand(
  modes: readonly DataExposureMode[],
): boolean {
  return (
    modes.includes("command-write") ||
    modes.includes("audit-append") ||
    modes.includes("job-progress")
  );
}
