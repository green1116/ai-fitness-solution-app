import { getQuotePersistenceAccess } from "../adapter/quote-persistence-access";
import {
  SAAS_PRODUCT_API_P4_TAG,
  SAAS_PRODUCT_API_VERSION,
} from "../shared/api-constants";
import { apiNotFound, apiTenantRequired, apiValidationFailed } from "../shared/api-errors";
import { withPersistence } from "../shared/map-persistence-error";
import type {
  ApiContext,
  ApiSuccessBody,
  QuoteApiData,
  QuoteCreateApiData,
  QuoteListApiData,
} from "../shared/api-types";
import {
  createQuoteBodySchema,
  updateQuoteBodySchema,
} from "../validation/schemas/quote.schema";

function p4Meta() {
  return {
    tag: SAAS_PRODUCT_API_P4_TAG,
    version: SAAS_PRODUCT_API_VERSION,
  } as const;
}

function requireTenantContext(ctx: ApiContext): asserts ctx is ApiContext & { tenantId: string } {
  if (!ctx.tenantId?.trim()) {
    throw apiTenantRequired("tenantId is required");
  }
}

async function requireWorkspaceForTenant(
  ctx: ApiContext & { tenantId: string },
  workspaceId: string,
): Promise<void> {
  const id = workspaceId.trim();
  if (!id) {
    throw apiValidationFailed("workspaceId is required");
  }
  const workspace = await ctx.runtime.workspace.resolve(id, ctx.tenantId);
  if (!workspace) {
    throw apiNotFound(`Workspace not found: ${id}`);
  }
}

export async function handleCreateQuote(
  ctx: ApiContext,
  workspaceId: string,
  body: unknown,
): Promise<ApiSuccessBody<QuoteCreateApiData>> {
  requireTenantContext(ctx);

  const parsed = createQuoteBodySchema.safeParse(body);
  if (!parsed.success) {
    throw apiValidationFailed(parsed.error.issues[0]?.message ?? "Invalid quote body");
  }

  await requireWorkspaceForTenant(ctx, workspaceId);

  const quoteAccess = getQuotePersistenceAccess(ctx.runtime);

  const quote = await withPersistence(() =>
    quoteAccess.create({
      workspaceId: workspaceId.trim(),
      tenantId: ctx.tenantId,
      title: parsed.data.title,
      metadata: parsed.data.metadata,
    }),
  );

  const workflowResult = await withPersistence(() =>
    ctx.runtime.quoteWorkflow.create({
      workspaceId: workspaceId.trim(),
      tenantId: ctx.tenantId,
      quoteId: quote.id,
      actor: ctx.actor,
    }),
  );

  return {
    ok: true,
    data: {
      quote,
      workflow: workflowResult.workflow,
    },
    meta: p4Meta(),
  };
}

export async function handleListQuotes(
  ctx: ApiContext,
  workspaceId: string,
): Promise<ApiSuccessBody<QuoteListApiData>> {
  requireTenantContext(ctx);
  await requireWorkspaceForTenant(ctx, workspaceId);

  const quoteAccess = getQuotePersistenceAccess(ctx.runtime);

  const quotes = await withPersistence(() =>
    quoteAccess.findByWorkspaceId(workspaceId.trim(), ctx.tenantId),
  );

  return {
    ok: true,
    data: { quotes },
    meta: p4Meta(),
  };
}

export async function handleGetQuote(
  ctx: ApiContext,
  quoteId: string,
): Promise<ApiSuccessBody<QuoteApiData>> {
  requireTenantContext(ctx);

  const id = quoteId.trim();
  if (!id) {
    throw apiValidationFailed("quoteId is required");
  }

  const quoteAccess = getQuotePersistenceAccess(ctx.runtime);

  const quote = await withPersistence(() => quoteAccess.findById(id, ctx.tenantId));
  if (!quote) {
    throw apiNotFound(`Quote not found: ${id}`);
  }

  return {
    ok: true,
    data: { quote },
    meta: p4Meta(),
  };
}

export async function handleUpdateQuote(
  ctx: ApiContext,
  quoteId: string,
  body: unknown,
): Promise<ApiSuccessBody<QuoteApiData>> {
  requireTenantContext(ctx);

  const id = quoteId.trim();
  if (!id) {
    throw apiValidationFailed("quoteId is required");
  }

  const parsed = updateQuoteBodySchema.safeParse(body);
  if (!parsed.success) {
    throw apiValidationFailed(parsed.error.issues[0]?.message ?? "Invalid quote update body");
  }

  const quoteAccess = getQuotePersistenceAccess(ctx.runtime);

  const existing = await withPersistence(() => quoteAccess.findById(id, ctx.tenantId));
  if (!existing) {
    throw apiNotFound(`Quote not found: ${id}`);
  }

  const quote = await withPersistence(() =>
    quoteAccess.update(id, ctx.tenantId, {
      title: parsed.data.title,
      status: parsed.data.status,
      metadata: parsed.data.metadata,
    }),
  );

  return {
    ok: true,
    data: { quote },
    meta: p4Meta(),
  };
}
