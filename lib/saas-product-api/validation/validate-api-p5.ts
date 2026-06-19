import { existsSync } from "fs";
import { join } from "path";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { PERSISTENCE_BACKEND_ENV_KEY } from "@/lib/saas-product-persistence";
import { getPersistenceRuntime, resetPersistenceRuntimeForTests } from "../adapter/get-persistence-runtime";
import { handleCreateQuote } from "../handlers/quote-handlers";
import { handleCreateWorkspace } from "../handlers/workspace-handlers";
import {
  handleGetWorkflow,
  handleListWorkflows,
  handleTransitionWorkflow,
} from "../handlers/workflow-handlers";
import { SAAS_PRODUCT_API_P5_TAG } from "../shared/api-constants";
import { isSaasProductApiError } from "../shared/api-errors";
import type { ApiContext, ApiP5Validation } from "../shared/api-types";

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

async function expectCrossTenantNotFound(ctx: ApiContext, quoteId: string): Promise<boolean> {
  try {
    await handleGetWorkflow(ctx, quoteId);
    return false;
  } catch (error) {
    return isSaasProductApiError(error) && error.status === 404;
  }
}

export async function validateApiP5(): Promise<ApiP5Validation> {
  process.env[PERSISTENCE_BACKEND_ENV_KEY] = "memory";
  resetPersistenceRuntimeForTests();

  const moduleRoot = join(process.cwd(), "lib", "saas-product-api");
  const quoteWorkflowRoute = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "quotes",
    "[quoteId]",
    "workflow",
    "route.ts",
  );
  const workflowsRoute = join(process.cwd(), "app", "api", "saas-product", "workflows", "route.ts");
  const transitionRoute = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workflows",
    "[workflowId]",
    "transition",
    "route.ts",
  );

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const enterpriseCtx = buildTenantContext("tenant-mock-enterprise", getDefaultMockMembershipUserId());
  const workspace = await handleCreateWorkspace(enterpriseCtx, {
    name: `p5-validate-workspace-${Date.now()}`,
    tenantId: "ignored-tenant-id",
  });
  const workspaceId = workspace.data.workspace.id;

  const created = await handleCreateQuote(enterpriseCtx, workspaceId, {
    title: `p5-validate-quote-${Date.now()}`,
    tenantId: "ignored-tenant-id",
  });
  const quoteId = created.data.quote.id;
  const workflowId = created.data.workflow.id;

  const workflowBeforeTransition = await handleGetWorkflow(enterpriseCtx, quoteId);
  const transitioned = await handleTransitionWorkflow(enterpriseCtx, workflowId, {
    toState: "APPROVED",
    tenantId: "ignored-tenant-id",
  });
  const listed = await handleListWorkflows(enterpriseCtx, workspaceId);
  const crossTenantBlocked = await expectCrossTenantNotFound(
    buildTenantContext("tenant-mock-contractor", CONTRACTOR_USER_ID),
    quoteId,
  );

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const valid =
    existsSync(join(moduleRoot, "handlers", "workflow-handlers.ts")) &&
    existsSync(join(moduleRoot, "validation", "schemas", "workflow.schema.ts")) &&
    existsSync(quoteWorkflowRoute) &&
    existsSync(workflowsRoute) &&
    existsSync(transitionRoute) &&
    created.data.workflow.quoteId === quoteId &&
    workflowBeforeTransition.data.workflow.id === workflowId &&
    transitioned.data.workflow.currentState === "APPROVED" &&
    transitioned.data.history.toState === "APPROVED" &&
    transitioned.data.event.eventType === "STATE_CHANGED" &&
    listed.data.workflows.some((item) => item.id === workflowId && item.currentState === "APPROVED") &&
    crossTenantBlocked;

  return {
    valid,
    summary: `p5Tag=${SAAS_PRODUCT_API_P5_TAG} workflowApiValid=${valid}`,
  };
}
