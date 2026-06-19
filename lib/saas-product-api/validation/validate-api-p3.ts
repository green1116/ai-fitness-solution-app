import { existsSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { PERSISTENCE_BACKEND_ENV_KEY } from "@/lib/saas-product-persistence";
import { getPersistenceRuntime, resetPersistenceRuntimeForTests } from "../adapter/get-persistence-runtime";
import { withApiContext } from "../auth/with-api-context";
import {
  handleCreateWorkspace,
  handleGetWorkspace,
  handleListWorkspaces,
  handleUpdateWorkspaceStatus,
} from "../handlers/workspace-handlers";
import {
  SAAS_PRODUCT_API_P3_TAG,
  SAAS_PRODUCT_API_WORKSPACES_PATH,
} from "../shared/api-constants";
import { API_ERROR_CODES, isSaasProductApiError } from "../shared/api-errors";
import type { ApiContext, ApiP3Validation } from "../shared/api-types";

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

async function expectCrossTenantNotFound(ctx: ApiContext, workspaceId: string): Promise<boolean> {
  try {
    await handleGetWorkspace(ctx, workspaceId);
    return false;
  } catch (error) {
    return isSaasProductApiError(error) && error.status === 404;
  }
}

export async function validateApiP3(): Promise<ApiP3Validation> {
  process.env[PERSISTENCE_BACKEND_ENV_KEY] = "memory";
  resetPersistenceRuntimeForTests();

  const moduleRoot = join(process.cwd(), "lib", "saas-product-api");
  const collectionRoute = join(process.cwd(), "app", "api", "saas-product", "workspaces", "route.ts");
  const itemRoute = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workspaces",
    "[workspaceId]",
    "route.ts",
  );

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const enterpriseCtx = buildTenantContext("tenant-mock-enterprise", getDefaultMockMembershipUserId());

  const created = await handleCreateWorkspace(enterpriseCtx, {
    name: "p3-validate-workspace",
    tenantId: "ignored-tenant-id",
  });
  const workspaceId = created.data.workspace.id;

  const listed = await handleListWorkspaces(enterpriseCtx);
  const resolved = await handleGetWorkspace(enterpriseCtx, workspaceId);
  const archived = await handleUpdateWorkspaceStatus(enterpriseCtx, workspaceId, {
    status: "ARCHIVED",
    tenantId: "ignored-tenant-id",
  });
  const crossTenantBlocked = await expectCrossTenantNotFound(
    buildTenantContext("tenant-mock-contractor", CONTRACTOR_USER_ID),
    workspaceId,
  );

  const unauthenticatedRequest = new NextRequest(`http://localhost${SAAS_PRODUCT_API_WORKSPACES_PATH}`);
  clearRuntimeSession();
  const unauthenticatedResponse = await withApiContext(
    unauthenticatedRequest,
    (ctx) => handleListWorkspaces(ctx),
    { requireTenant: true },
  );
  const unauthenticatedBody = (await unauthenticatedResponse.json()) as { code?: string };

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const valid =
    existsSync(join(moduleRoot, "handlers", "workspace-handlers.ts")) &&
    existsSync(join(moduleRoot, "validation", "schemas", "workspace.schema.ts")) &&
    existsSync(collectionRoute) &&
    existsSync(itemRoute) &&
    created.data.workspace.tenantId === "tenant-mock-enterprise" &&
    created.data.workspace.name === "p3-validate-workspace" &&
    listed.data.workspaces.some((item) => item.id === workspaceId) &&
    resolved.data.workspace.id === workspaceId &&
    archived.data.workspace.status === "ARCHIVED" &&
    crossTenantBlocked &&
    unauthenticatedResponse.status === 401 &&
    unauthenticatedBody.code === API_ERROR_CODES.API_UNAUTHORIZED;

  return {
    valid,
    summary: `p3Tag=${SAAS_PRODUCT_API_P3_TAG} workspaceApiValid=${valid}`,
  };
}
