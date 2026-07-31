/**
 * PI-4.2 — Repository access bindings to existing modules (PD-5.4 §4 / §6).
 * Plans access through existing implementations — no new repo families or schemas.
 */
import type { PersistenceModelKind } from "../foundation/persistence-models";
import type { RepositoryId } from "../foundation/repository-catalogue";
import { REPOSITORY_LAYER_ID } from "./repository.constants";

export type RepositoryAccessKind =
  | "prisma-service"
  | "filesystem-object"
  | "session-store"
  | "scaffold-runtime"
  | "in-process-registry"
  | "audit-log";

export type RepositoryAccessCapability = "read" | "write";

export type RepositoryAccessBinding = Readonly<{
  repositoryId: RepositoryId;
  accessKind: RepositoryAccessKind;
  /** Preferred existing access module (from PI-4.1 catalogue). */
  primaryModule: string;
  supportingModules: readonly string[];
  /** Persistence model ids from PI-4.1 registry served by this binding. */
  modelIds: readonly string[];
  modelKinds: readonly PersistenceModelKind[];
  capabilities: readonly RepositoryAccessCapability[];
  notes: string;
}>;

export const REPOSITORY_ACCESS_BINDINGS = [
  {
    repositoryId: "REPO-KNOWLEDGE",
    accessKind: "prisma-service",
    primaryModule: "lib/services/tender.service.ts",
    supportingModules: [
      "lib/services/quote.service.ts",
      "lib/portal/v58/documents/documents.aggregator.ts",
      "prisma/schema.prisma",
    ],
    modelIds: ["Tender", "Quote"],
    modelKinds: ["prisma"],
    capabilities: ["read", "write"],
    notes: "Existing tender/quote services",
  },
  {
    repositoryId: "REPO-ARTIFACT",
    accessKind: "filesystem-object",
    primaryModule: "lib/storage/plan-storage.ts",
    supportingModules: [
      "lib/scaffold/v80/pdf/artifact.service.ts",
      "lib/audit/pdfLog.ts",
      "prisma/schema.prisma",
    ],
    modelIds: ["PlanStorage", "DocumentExport"],
    modelKinds: ["filesystem", "prisma"],
    capabilities: ["read", "write"],
    notes: "FS artifact bytes + DocumentExport metadata",
  },
  {
    repositoryId: "REPO-AGENT-RUN",
    accessKind: "scaffold-runtime",
    primaryModule: "lib/scaffold/v80/runtime/prisma.backend.ts",
    supportingModules: [
      "lib/scaffold/v80/routes/autopilot-job.route.ts",
      "lib/services/tender/provisionProjectFromPlan.ts",
      "prisma/schema.prisma",
    ],
    modelIds: ["PlanJob", "V80ScaffoldPlanJob"],
    modelKinds: ["prisma"],
    capabilities: ["read", "write"],
    notes: "Existing job / autopilot run stores",
  },
  {
    repositoryId: "REPO-PROJECT",
    accessKind: "prisma-service",
    primaryModule: "lib/services/project.service.ts",
    supportingModules: ["prisma/schema.prisma"],
    modelIds: ["Project", "PrismaClientEntry"],
    modelKinds: ["prisma"],
    capabilities: ["read", "write"],
    notes: "Existing project service",
  },
  {
    repositoryId: "REPO-TENANT-USER",
    accessKind: "prisma-service",
    primaryModule: "lib/auth/user.service.ts",
    supportingModules: [
      "lib/organization",
      "lib/scaffold/v80/services/tenant.service.ts",
      "prisma/schema.prisma",
    ],
    modelIds: ["User", "Organization", "OrganizationMember"],
    modelKinds: ["prisma"],
    capabilities: ["read", "write"],
    notes: "Existing user / org / tenant modules",
  },
  {
    repositoryId: "REPO-SESSION",
    accessKind: "session-store",
    primaryModule: "lib/session.ts",
    supportingModules: [
      "lib/auth/session.service.ts",
      "prisma/schema.prisma",
    ],
    modelIds: ["Session", "EmailOtp"],
    modelKinds: ["prisma"],
    capabilities: ["read", "write"],
    notes: "Existing session / OTP stores",
  },
  {
    repositoryId: "REPO-INTELLIGENCE",
    accessKind: "prisma-service",
    primaryModule: "lib/services/budget.service.ts",
    supportingModules: ["lib/crm", "prisma/schema.prisma"],
    modelIds: ["Budget", "Solution", "Opportunity", "Lead"],
    modelKinds: ["prisma"],
    capabilities: ["read", "write"],
    notes: "Existing budget / CRM intelligence stores",
  },
  {
    repositoryId: "REPO-EVOLUTION",
    accessKind: "in-process-registry",
    primaryModule: "lib/product/m15/feedback",
    supportingModules: [
      "lib/operations/governance",
      "lib/download-token.ts",
    ],
    modelIds: ["M15FeedbackRegistry", "GovernancePersistence"],
    modelKinds: ["in-process"],
    capabilities: ["read", "write"],
    notes: "Existing Evolution feedback / governance surfaces",
  },
  {
    repositoryId: "REPO-OPS-AUDIT",
    accessKind: "audit-log",
    primaryModule: "lib/audit/pdfLog.ts",
    supportingModules: [
      "lib/operations/governance",
      "lib/prisma-stability/audit",
      "prisma/schema.prisma",
    ],
    modelIds: ["PdfDownloadLog"],
    modelKinds: ["prisma"],
    capabilities: ["read", "write"],
    notes: "Existing ops audit / download log",
  },
] as const satisfies readonly RepositoryAccessBinding[];

export function getRepositoryAccessBinding(
  repositoryId: RepositoryId,
): RepositoryAccessBinding | undefined {
  return REPOSITORY_ACCESS_BINDINGS.find(
    (row) => row.repositoryId === repositoryId,
  );
}

export function assertRepositoryLayerId(): typeof REPOSITORY_LAYER_ID {
  return REPOSITORY_LAYER_ID;
}
