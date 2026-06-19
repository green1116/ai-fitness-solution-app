import { getQuotePersistenceAccess } from "../adapter/quote-persistence-access";
import { getWorkflowPersistenceAccess } from "../adapter/workflow-persistence-access";
import {
  SAAS_PRODUCT_API_P5_TAG,
  SAAS_PRODUCT_API_VERSION,
} from "../shared/api-constants";
import { apiNotFound, apiTenantRequired, apiValidationFailed } from "../shared/api-errors";
import { withPersistence } from "../shared/map-persistence-error";
import type {
  ApiContext,
  ApiSuccessBody,
  WorkflowGetApiData,
  WorkflowListApiData,
  WorkflowTransitionApiData,
} from "../shared/api-types";
import { transitionWorkflowBodySchema } from "../validation/schemas/workflow.schema";

function p5Meta() {
  return {
    tag: SAAS_PRODUCT_API_P5_TAG,
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

export async function handleGetWorkflow(
  ctx: ApiContext,
  quoteId: string,
): Promise<ApiSuccessBody<WorkflowGetApiData>> {
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

  const workflowAccess = getWorkflowPersistenceAccess(ctx.runtime);
  const workflows = await withPersistence(() => workflowAccess.findByQuoteId(id, ctx.tenantId));
  const workflow = workflows.find((item) => item.workflowType === "QUOTE") ?? workflows[0];
  if (!workflow) {
    throw apiNotFound(`Workflow not found for quote: ${id}`);
  }

  return {
    ok: true,
    data: { workflow },
    meta: p5Meta(),
  };
}

export async function handleListWorkflows(
  ctx: ApiContext,
  workspaceId: string,
): Promise<ApiSuccessBody<WorkflowListApiData>> {
  requireTenantContext(ctx);
  await requireWorkspaceForTenant(ctx, workspaceId);

  const workflows = await withPersistence(() =>
    ctx.runtime.quoteWorkflow.list(workspaceId.trim(), ctx.tenantId),
  );

  return {
    ok: true,
    data: { workflows },
    meta: p5Meta(),
  };
}

export async function handleTransitionWorkflow(
  ctx: ApiContext,
  workflowId: string,
  body: unknown,
): Promise<ApiSuccessBody<WorkflowTransitionApiData>> {
  requireTenantContext(ctx);

  const id = workflowId.trim();
  if (!id) {
    throw apiValidationFailed("workflowId is required");
  }

  const parsed = transitionWorkflowBodySchema.safeParse(body);
  if (!parsed.success) {
    throw apiValidationFailed(parsed.error.issues[0]?.message ?? "Invalid workflow transition body");
  }

  const workflowAccess = getWorkflowPersistenceAccess(ctx.runtime);
  const existing = await withPersistence(() => workflowAccess.findById(id, ctx.tenantId));
  if (!existing) {
    throw apiNotFound(`Workflow not found: ${id}`);
  }

  const result = await withPersistence(() =>
    ctx.runtime.quoteWorkflow.transition({
      workflowId: id,
      tenantId: ctx.tenantId,
      toState: parsed.data.toState,
      actor: ctx.actor,
      reason: parsed.data.reason,
    }),
  );

  return {
    ok: true,
    data: {
      workflow: result.workflow,
      history: result.history,
      event: result.event,
    },
    meta: p5Meta(),
  };
}
