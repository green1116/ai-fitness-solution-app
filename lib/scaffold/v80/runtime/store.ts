/** V80 CODE P3 — unified persistence facade (Prisma primary, memory fallback) */
export type { V80Plan } from "./types";
export {
  slugifyName,
  budgetIdempotencyKey,
  workflowIdempotencyKey,
} from "./types";
export type {
  V80Organization,
  V80Project,
  V80Tender,
  V80Quote,
  V80Budget,
  V80WorkflowJob,
  V80WorkflowStepState,
  V80PdfArtifact,
} from "./types";

import { prismaBackend, isV80PrismaAvailable, hasV80PrismaModels } from "./prisma.backend";
import { memoryBackend } from "./memory.backend";

export const v80Persist = prismaBackend;

export async function getV80PersistenceMode(): Promise<"prisma" | "memory"> {
  return (await isV80PrismaAvailable()) ? "prisma" : "memory";
}

/** @deprecated P2 compat — use v80Persist.listArtifactsByProject */
export const v80Store = {
  get artifacts() {
    return memoryBackend.snapshot().artifacts;
  },
  findOrgBySlug: (slug: string) => memoryBackend.findOrgBySlug(slug),
  incrementUsage: (orgId: string, type: string) => memoryBackend.incrementUsage(orgId, type),
  getUsageMap: (orgId: string) => memoryBackend.getUsageMap(orgId),
};

export { hasV80PrismaModels, memoryBackend };
