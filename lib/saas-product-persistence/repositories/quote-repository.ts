import { prisma } from "@/lib/prisma";
import {
  QUOTE_STATUS_TRANSITIONS,
} from "../shared/persistence-constants";
import type {
  CreateQuoteInput,
  QuoteRecord,
  QuoteStatus,
  UpdateQuoteInput,
} from "../shared/persistence-types";
import { PERSISTENCE_ERROR_CODES, SaasProductPersistenceError } from "../shared/persistence-errors";
import {
  toNullableQuoteDomain,
  toQuoteDomain,
  toQuotePersistenceMetadata,
} from "../mappers/quote-mapper";
import type { QuoteRepository } from "../contracts/persistence-contracts";
import { assertWorkspaceTenant } from "./tenant-guard";

function assertQuoteTransition(from: QuoteStatus, to: QuoteStatus): void {
  const allowed = QUOTE_STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION,
      `Quote transition denied: ${from} -> ${to}`,
    );
  }
}

async function requireQuote(id: string, tenantId: string): Promise<QuoteRecord> {
  const row = await prisma.quote.findFirst({
    where: { id, tenantId },
  });
  const domain = toNullableQuoteDomain(row);
  if (!domain) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND,
      `Quote not found: ${id}`,
    );
  }
  return domain;
}

async function transitionQuote(id: string, tenantId: string, toStatus: QuoteStatus): Promise<QuoteRecord> {
  const current = await requireQuote(id, tenantId);
  assertQuoteTransition(current.status, toStatus);
  const row = await prisma.quote.update({
    where: { id },
    data: { status: toStatus },
  });
  return toQuoteDomain(row);
}

export const quoteRepository: QuoteRepository = {
  async create(input: CreateQuoteInput): Promise<QuoteRecord> {
    await assertWorkspaceTenant(input.workspaceId, input.tenantId);
    const row = await prisma.quote.create({
      data: {
        workspaceId: input.workspaceId,
        tenantId: input.tenantId,
        title: input.title,
        status: input.status ?? "DRAFT",
        metadata: toQuotePersistenceMetadata(input.metadata),
      },
    });
    return toQuoteDomain(row);
  },

  async update(id: string, tenantId: string, input: UpdateQuoteInput): Promise<QuoteRecord> {
    const current = await requireQuote(id, tenantId);
    if (input.status && input.status !== current.status) {
      assertQuoteTransition(current.status, input.status);
    }
    const row = await prisma.quote.update({
      where: { id },
      data: {
        title: input.title,
        status: input.status,
        metadata: input.metadata ? toQuotePersistenceMetadata(input.metadata) : undefined,
      },
    });
    return toQuoteDomain(row);
  },

  async approve(id: string, tenantId: string): Promise<QuoteRecord> {
    return transitionQuote(id, tenantId, "APPROVED");
  },

  async reject(id: string, tenantId: string): Promise<QuoteRecord> {
    return transitionQuote(id, tenantId, "REJECTED");
  },

  async archive(id: string, tenantId: string): Promise<QuoteRecord> {
    return transitionQuote(id, tenantId, "ARCHIVED");
  },

  async findById(id: string, tenantId: string): Promise<QuoteRecord | null> {
    const row = await prisma.quote.findFirst({
      where: { id, tenantId },
    });
    return toNullableQuoteDomain(row);
  },

  async findByWorkspaceId(workspaceId: string, tenantId: string): Promise<QuoteRecord[]> {
    await assertWorkspaceTenant(workspaceId, tenantId);
    const rows = await prisma.quote.findMany({
      where: { workspaceId, tenantId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toQuoteDomain);
  },
};

export const createQuote = quoteRepository.create.bind(quoteRepository);
export const updateQuote = quoteRepository.update.bind(quoteRepository);
export const approveQuote = quoteRepository.approve.bind(quoteRepository);
export const rejectQuote = quoteRepository.reject.bind(quoteRepository);
export const archiveQuote = quoteRepository.archive.bind(quoteRepository);
export const findQuoteById = quoteRepository.findById.bind(quoteRepository);
export const findQuotesByWorkspaceId = quoteRepository.findByWorkspaceId.bind(quoteRepository);
