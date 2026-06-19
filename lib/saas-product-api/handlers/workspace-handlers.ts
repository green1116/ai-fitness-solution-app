import {
  SAAS_PRODUCT_API_P3_TAG,
  SAAS_PRODUCT_API_VERSION,
} from "../shared/api-constants";
import { apiNotFound, apiTenantRequired, apiValidationFailed } from "../shared/api-errors";
import type {
  ApiContext,
  ApiSuccessBody,
  WorkspaceApiData,
  WorkspaceListApiData,
} from "../shared/api-types";
import {
  createWorkspaceBodySchema,
  updateWorkspaceStatusBodySchema,
} from "../validation/schemas/workspace.schema";

function p3Meta() {
  return {
    tag: SAAS_PRODUCT_API_P3_TAG,
    version: SAAS_PRODUCT_API_VERSION,
  } as const;
}

function requireTenantContext(ctx: ApiContext): asserts ctx is ApiContext & { tenantId: string } {
  if (!ctx.tenantId?.trim()) {
    throw apiTenantRequired("tenantId is required");
  }
}

export async function handleCreateWorkspace(
  ctx: ApiContext,
  body: unknown,
): Promise<ApiSuccessBody<WorkspaceApiData>> {
  requireTenantContext(ctx);

  const parsed = createWorkspaceBodySchema.safeParse(body);
  if (!parsed.success) {
    throw apiValidationFailed(parsed.error.issues[0]?.message ?? "Invalid workspace body");
  }

  const workspace = await ctx.runtime.workspace.create({
    tenantId: ctx.tenantId,
    name: parsed.data.name,
  });

  return {
    ok: true,
    data: { workspace },
    meta: p3Meta(),
  };
}

export async function handleListWorkspaces(
  ctx: ApiContext,
): Promise<ApiSuccessBody<WorkspaceListApiData>> {
  requireTenantContext(ctx);

  const workspaces = await ctx.runtime.workspace.list(ctx.tenantId);

  return {
    ok: true,
    data: { workspaces },
    meta: p3Meta(),
  };
}

export async function handleGetWorkspace(
  ctx: ApiContext,
  workspaceId: string,
): Promise<ApiSuccessBody<WorkspaceApiData>> {
  requireTenantContext(ctx);

  const id = workspaceId.trim();
  if (!id) {
    throw apiValidationFailed("workspaceId is required");
  }

  const workspace = await ctx.runtime.workspace.resolve(id, ctx.tenantId);
  if (!workspace) {
    throw apiNotFound(`Workspace not found: ${id}`);
  }

  return {
    ok: true,
    data: { workspace },
    meta: p3Meta(),
  };
}

export async function handleUpdateWorkspaceStatus(
  ctx: ApiContext,
  workspaceId: string,
  body: unknown,
): Promise<ApiSuccessBody<WorkspaceApiData>> {
  requireTenantContext(ctx);

  const id = workspaceId.trim();
  if (!id) {
    throw apiValidationFailed("workspaceId is required");
  }

  const parsed = updateWorkspaceStatusBodySchema.safeParse(body);
  if (!parsed.success) {
    throw apiValidationFailed(parsed.error.issues[0]?.message ?? "Invalid workspace status body");
  }

  const existing = await ctx.runtime.workspace.resolve(id, ctx.tenantId);
  if (!existing) {
    throw apiNotFound(`Workspace not found: ${id}`);
  }

  const workspace =
    parsed.data.status === "ARCHIVED"
      ? await ctx.runtime.workspace.archive(id, ctx.tenantId)
      : await ctx.runtime.workspace.updateStatus({
          workspaceId: id,
          tenantId: ctx.tenantId,
          status: parsed.data.status,
        });

  return {
    ok: true,
    data: { workspace },
    meta: p3Meta(),
  };
}
