/**
 * V80 CODE P1 — Prisma entity skeleton (no relation logic)
 * Reference only — merge into schema.prisma manually
 */

export const V80_PRISMA_SKELETON_PATH = "prisma/scaffold/v80-entities.prisma";

export const V80_PRISMA_ENTITIES = [
  "Organization",
  "OrganizationMember",
  "User",
  "Project",
  "Tender",
  "Quote",
  "Budget",
  "DocumentExport",
  "Subscription",
  "UsageRecord",
  "PlanJob",
  "PdfDownloadLog",
] as const;

export function isPrismaSkeletonComplete(): boolean {
  return V80_PRISMA_ENTITIES.length === 12;
}
