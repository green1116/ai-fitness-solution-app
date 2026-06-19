import type { Quote as PrismaQuote, Prisma } from "@prisma/client";
import type { QuoteRecord, QuoteStatus } from "../shared/persistence-types";

function toIso(date: Date): string {
  return date.toISOString();
}

function toMetadata(value: PrismaQuote["metadata"]): Record<string, unknown> | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export function toQuoteDomain(row: PrismaQuote): QuoteRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    tenantId: row.tenantId,
    title: row.title,
    status: row.status as QuoteStatus,
    metadata: toMetadata(row.metadata),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function toNullableQuoteDomain(row: PrismaQuote | null): QuoteRecord | null {
  return row ? toQuoteDomain(row) : null;
}

export function toQuotePersistenceMetadata(metadata?: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  return metadata as Prisma.InputJsonValue | undefined;
}
