/**
 * V80 APP P3 — Prisma relation model (FK, cascade, indexing notes)
 */
import type { PrismaRelationSpec } from "./blueprint.types";

export const PRISMA_RELATION_MODEL: PrismaRelationSpec[] = [
  {
    id: "BLP-REL-001",
    from: "OrganizationMember",
    to: "Organization",
    fk: "organizationId → Organization.id",
    onDelete: "Cascade",
    index: ["@@index([userId])", "@@unique([organizationId, userId])"],
    notes: "Tenant membership; cascade delete on org removal",
  },
  {
    id: "BLP-REL-002",
    from: "OrganizationMember",
    to: "User",
    fk: "userId → User.id",
    onDelete: "Cascade",
    index: ["@@index([userId])"],
    notes: "User may belong to multiple orgs",
  },
  {
    id: "BLP-REL-003",
    from: "Project",
    to: "Organization",
    fk: "organizationId → Organization.id",
    onDelete: "Cascade",
    index: ["@@index([organizationId])"],
    notes: "Gym project scoped to tenant",
  },
  {
    id: "BLP-REL-004",
    from: "Tender",
    to: "Project",
    fk: "projectId → Project.id",
    onDelete: "Cascade",
    index: ["@@index([projectId])", "@@index([status])"],
    notes: "RFP intake linked to project",
  },
  {
    id: "BLP-REL-005",
    from: "Quote",
    to: "Organization",
    fk: "organizationId → Organization.id",
    onDelete: "Cascade",
    index: ["@@index([organizationId])"],
    notes: "Quote owned by tenant",
  },
  {
    id: "BLP-REL-006",
    from: "Budget",
    to: "Quote",
    fk: "quoteId → Quote.id",
    onDelete: "Cascade",
    index: ["@@index([quoteId])"],
    notes: "Budget derived from quote; 1:N allowed",
  },
  {
    id: "BLP-REL-007",
    from: "DocumentExport",
    to: "Project",
    fk: "projectId → Project.id",
    onDelete: "Cascade",
    index: ["@@index([projectId])", "@@index([type, createdAt])"],
    notes: "PDF artifact storage pointer",
  },
  {
    id: "BLP-REL-008",
    from: "Subscription",
    to: "Organization",
    fk: "organizationId → Organization.id",
    onDelete: "Cascade",
    index: ["@@unique([organizationId])", "@@index([status])"],
    notes: "One active subscription per org",
  },
  {
    id: "BLP-REL-009",
    from: "UsageRecord",
    to: "Organization",
    fk: "organizationId → Organization.id",
    onDelete: "Cascade",
    index: ["@@index([organizationId, usageType, createdAt])"],
    notes: "Meter budget/plan/quote generation",
  },
  {
    id: "BLP-REL-010",
    from: "PdfDownloadLog",
    to: "DocumentExport",
    fk: "exportId → DocumentExport.id",
    onDelete: "SetNull",
    index: ["@@index([exportId])", "@@index([downloadedAt])"],
    notes: "Audit PDF downloads; preserve log on export delete",
  },
];

export function isPrismaRelationModelComplete(): boolean {
  const chain = ["Organization", "Project", "Tender", "Quote", "Budget", "DocumentExport"];
  const covered = new Set(PRISMA_RELATION_MODEL.flatMap((r) => [r.from, r.to]));
  return (
    PRISMA_RELATION_MODEL.length === 10 &&
    chain.every((m) => covered.has(m))
  );
}

export function getPrismaRelationsForModel(model: string): PrismaRelationSpec[] {
  return PRISMA_RELATION_MODEL.filter((r) => r.from === model || r.to === model);
}
