import { existsSync } from "fs";
import { join } from "path";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { PERSISTENCE_BACKEND_ENV_KEY } from "@/lib/saas-product-persistence";
import { getPersistenceRuntime, resetPersistenceRuntimeForTests } from "../adapter/get-persistence-runtime";
import { handleListWorkflowEvents, handleListWorkflowHistory } from "../handlers/audit-handlers";
import { handleCreateQuote } from "../handlers/quote-handlers";
import { handleCreateWorkspace } from "../handlers/workspace-handlers";
import { handleTransitionWorkflow } from "../handlers/workflow-handlers";
import { SAAS_PRODUCT_API_P6_TAG } from "../shared/api-constants";
import { isSaasProductApiError } from "../shared/api-errors";
import type { ApiContext, ApiP6Validation } from "../shared/api-types";

const CONTRACTOR_USER_ID = "user-mock-contractor-pm";

function buildTenantContext(tenantId: string, userId: string): ApiContext {
  const runtime = getPersistenceRuntime();
  return {
    tenantId,
    userId,
    actor: userId,
    runtime,
    backend: runtime.backend,
  };
}

async function expectCrossTenantNotFound(ctx: ApiContext, workflowId: string): Promise<boolean> {
  try {
    await handleListWorkflowHistory(ctx, workflowId);
    return false;
  } catch (error) {
    return isSaasProductApiError(error) && error.status === 404;
  }
}

export async function validateApiP6(): Promise<ApiP6Validation> {
  process.env[PERSISTENCE_BACKEND_ENV_KEY] = "memory";
  resetPersistenceRuntimeForTests();

  const moduleRoot = join(process.cwd(), "lib", "saas-product-api");
  const historyRoute = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workflows",
    "[workflowId]",
    "history",
    "route.ts",
  );
  const eventsRoute = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workflows",
    "[workflowId]",
    "events",
    "route.ts",
  );

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const enterpriseCtx = buildTenantContext("tenant-mock-enterprise", getDefaultMockMembershipUserId());
  const workspace = await handleCreateWorkspace(enterpriseCtx, {
    name: `p6-validate-workspace-${Date.now()}`,
    tenantId: "ignored-tenant-id",
  });
  const workspaceId = workspace.data.workspace.id;

  const created = await handleCreateQuote(enterpriseCtx, workspaceId, {
    title: `p6-validate-quote-${Date.now()}`,
    tenantId: "ignored-tenant-id",
  });
  const workflowId = created.data.workflow.id;

  await handleTransitionWorkflow(enterpriseCtx, workflowId, {
    toState: "APPROVED",
    tenantId: "ignored-tenant-id",
  });

  const history = await handleListWorkflowHistory(enterpriseCtx, workflowId);
  const events = await handleListWorkflowEvents(enterpriseCtx, workflowId);
  const crossTenantBlocked = await expectCrossTenantNotFound(
    buildTenantContext("tenant-mock-contractor", CONTRACTOR_USER_ID),
    workflowId,
  );

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const valid =
    existsSync(join(moduleRoot, "handlers", "audit-handlers.ts")) &&
    existsSync(join(moduleRoot, "adapter", "audit-persistence-access.ts")) &&
    existsSync(historyRoute) &&
    existsSync(eventsRoute) &&
    created.data.workflow.currentState === "CREATED" &&
    history.data.history.length > 0 &&
    events.data.events.length > 0 &&
    crossTenantBlocked;

  return {
    valid,
    summary: `p6Tag=${SAAS_PRODUCT_API_P6_TAG} auditReadApiValid=${valid}`,
  };
}
