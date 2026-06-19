import { existsSync } from "fs";
import { join } from "path";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { PERSISTENCE_BACKEND_ENV_KEY } from "@/lib/saas-product-persistence";
import { getPersistenceRuntime, resetPersistenceRuntimeForTests } from "../adapter/get-persistence-runtime";
import {
  handleCreateQuote,
  handleGetQuote,
  handleListQuotes,
  handleUpdateQuote,
} from "../handlers/quote-handlers";
import {
  handleCreateWorkspace,
} from "../handlers/workspace-handlers";
import { SAAS_PRODUCT_API_P4_TAG } from "../shared/api-constants";
import { isSaasProductApiError } from "../shared/api-errors";
import type { ApiContext, ApiP4Validation } from "../shared/api-types";

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
    await handleGetQuote(ctx, quoteId);
    return false;
  } catch (error) {
    return isSaasProductApiError(error) && error.status === 404;
  }
}

export async function validateApiP4(): Promise<ApiP4Validation> {
  process.env[PERSISTENCE_BACKEND_ENV_KEY] = "memory";
  resetPersistenceRuntimeForTests();

  const moduleRoot = join(process.cwd(), "lib", "saas-product-api");
  const collectionRoute = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workspaces",
    "[workspaceId]",
    "quotes",
    "route.ts",
  );
  const itemRoute = join(process.cwd(), "app", "api", "saas-product", "quotes", "[quoteId]", "route.ts");

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const enterpriseCtx = buildTenantContext("tenant-mock-enterprise", getDefaultMockMembershipUserId());
  const workspace = await handleCreateWorkspace(enterpriseCtx, {
    name: `p4-validate-workspace-${Date.now()}`,
    tenantId: "ignored-tenant-id",
  });
  const workspaceId = workspace.data.workspace.id;

  const created = await handleCreateQuote(enterpriseCtx, workspaceId, {
    title: `p4-validate-quote-${Date.now()}`,
    tenantId: "ignored-tenant-id",
  });
  const quoteId = created.data.quote.id;

  const listed = await handleListQuotes(enterpriseCtx, workspaceId);
  const resolved = await handleGetQuote(enterpriseCtx, quoteId);
  const updated = await handleUpdateQuote(enterpriseCtx, quoteId, {
    status: "APPROVED",
    tenantId: "ignored-tenant-id",
  });
  const crossTenantBlocked = await expectCrossTenantNotFound(
    buildTenantContext("tenant-mock-contractor", CONTRACTOR_USER_ID),
    quoteId,
  );

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const valid =
    existsSync(join(moduleRoot, "handlers", "quote-handlers.ts")) &&
    existsSync(join(moduleRoot, "validation", "schemas", "quote.schema.ts")) &&
    existsSync(collectionRoute) &&
    existsSync(itemRoute) &&
    created.data.quote.tenantId === "tenant-mock-enterprise" &&
    created.data.workflow.quoteId === quoteId &&
    listed.data.quotes.some((item) => item.id === quoteId) &&
    resolved.data.quote.id === quoteId &&
    updated.data.quote.status === "APPROVED" &&
    crossTenantBlocked;

  return {
    valid,
    summary: `p4Tag=${SAAS_PRODUCT_API_P4_TAG} quoteApiValid=${valid}`,
  };
}
