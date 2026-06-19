import { getAuditPersistenceAccess } from "../adapter/audit-persistence-access";
import { getWorkflowPersistenceAccess } from "../adapter/workflow-persistence-access";
import {
  SAAS_PRODUCT_API_P6_TAG,
  SAAS_PRODUCT_API_VERSION,
} from "../shared/api-constants";
import { apiNotFound, apiTenantRequired, apiValidationFailed } from "../shared/api-errors";
import { withPersistence } from "../shared/map-persistence-error";
import type {
  ApiContext,
  ApiSuccessBody,
  WorkflowEventListApiData,
  WorkflowHistoryListApiData,
} from "../shared/api-types";

function p6Meta() {
  return {
    tag: SAAS_PRODUCT_API_P6_TAG,
    version: SAAS_PRODUCT_API_VERSION,
  } as const;
}

function requireTenantContext(ctx: ApiContext): asserts ctx is ApiContext & { tenantId: string } {
  if (!ctx.tenantId?.trim()) {
    throw apiTenantRequired("tenantId is required");
  }
}

async function requireWorkflowForTenant(
  ctx: ApiContext & { tenantId: string },
  workflowId: string,
): Promise<void> {
  const id = workflowId.trim();
  if (!id) {
    throw apiValidationFailed("workflowId is required");
  }
  const workflowAccess = getWorkflowPersistenceAccess(ctx.runtime);
  const existing = await withPersistence(() => workflowAccess.findById(id, ctx.tenantId));
  if (!existing) {
    throw apiNotFound(`Workflow not found: ${id}`);
  }
}

export async function handleListWorkflowHistory(
  ctx: ApiContext,
  workflowId: string,
): Promise<ApiSuccessBody<WorkflowHistoryListApiData>> {
  requireTenantContext(ctx);
  await requireWorkflowForTenant(ctx, workflowId);

  const auditAccess = getAuditPersistenceAccess(ctx.runtime);
  const history = await withPersistence(() =>
    auditAccess.listHistory(workflowId.trim(), ctx.tenantId),
  );

  return {
    ok: true,
    data: { history },
    meta: p6Meta(),
  };
}

export async function handleListWorkflowEvents(
  ctx: ApiContext,
  workflowId: string,
): Promise<ApiSuccessBody<WorkflowEventListApiData>> {
  requireTenantContext(ctx);
  await requireWorkflowForTenant(ctx, workflowId);

  const auditAccess = getAuditPersistenceAccess(ctx.runtime);
  const events = await withPersistence(() =>
    auditAccess.listEvents(workflowId.trim(), ctx.tenantId),
  );

  return {
    ok: true,
    data: { events },
    meta: p6Meta(),
  };
}
