/**
 * V51 API Exposure — P6 Audit Read API verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { PERSISTENCE_BACKEND_ENV_KEY } from "@/lib/saas-product-persistence";
import {
  API_ERROR_CODES,
  SAAS_PRODUCT_API_META,
  SAAS_PRODUCT_API_P6_TAG,
  V50_PERSISTENCE_DEPENDENCY_TAG,
  resetPersistenceRuntimeForTests,
  validateApiP6,
  withApiContext,
  handleCreateQuote,
  handleCreateWorkspace,
  handleListWorkflowEvents,
  handleListWorkflowHistory,
  handleTransitionWorkflow,
} from "../lib/saas-product-api";

const CONTRACTOR_USER_ID = "user-mock-contractor-pm";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertRouteHasNoForbiddenImports(routePath: string) {
  const content = readFileSync(routePath, "utf8");
  assert(!content.includes("@/lib/prisma"), `${routePath} must not import prisma`);
  assert(!content.includes("persistenceRepositories"), `${routePath} must not import repositories`);
  assert(!content.includes("lib/saas-product/"), `${routePath} must not import V49 runtime`);
}

async function main() {
  process.env[PERSISTENCE_BACKEND_ENV_KEY] = "memory";
  resetPersistenceRuntimeForTests();

  const validation = await validateApiP6();
  assert(validation.valid, `P6 audit read API validation: ${validation.summary}`);
  console.log("✓ P6 audit read API validation ok");

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const workspaceName = `verify-v51-p6-workspace-${Date.now()}`;
  const workspaceResponse = await withApiContext(
    new NextRequest("http://localhost/api/saas-product/workspaces", {
      method: "POST",
      body: JSON.stringify({ name: workspaceName }),
      headers: { "content-type": "application/json" },
    }),
    async (ctx) => handleCreateWorkspace(ctx, { name: workspaceName, tenantId: "must-be-ignored" }),
    { requireTenant: true },
  );
  const workspaceBody = await workspaceResponse.json();
  assert(workspaceResponse.status === 200, "create workspace for audit test");
  const workspaceId = workspaceBody.data.workspace.id as string;
  console.log("✓ workspace ready for audit test");

  const quoteTitle = `verify-v51-p6-quote-${Date.now()}`;
  const createQuoteRequest = new NextRequest(
    `http://localhost/api/saas-product/workspaces/${workspaceId}/quotes`,
    {
      method: "POST",
      body: JSON.stringify({ title: quoteTitle, tenantId: "must-be-ignored" }),
      headers: { "content-type": "application/json" },
    },
  );
  const createQuoteResponse = await withApiContext(
    createQuoteRequest,
    async (ctx) => handleCreateQuote(ctx, workspaceId, await createQuoteRequest.json()),
    { requireTenant: true },
  );
  const createQuoteBody = await createQuoteResponse.json();
  assert(createQuoteResponse.status === 200, "create quote returns 200");
  assert(createQuoteBody.data?.workflow?.currentState === "CREATED", "workflow auto-created");
  const workflowId = createQuoteBody.data.workflow.id as string;
  console.log("✓ create quote + workflow ok");

  const transitionRequest = new NextRequest(
    `http://localhost/api/saas-product/workflows/${workflowId}/transition`,
    {
      method: "POST",
      body: JSON.stringify({ toState: "APPROVED", tenantId: "must-be-ignored" }),
      headers: { "content-type": "application/json" },
    },
  );
  const transitionResponse = await withApiContext(
    transitionRequest,
    async (ctx) => handleTransitionWorkflow(ctx, workflowId, await transitionRequest.json()),
    { requireTenant: true },
  );
  assert(transitionResponse.status === 200, "transition workflow returns 200");
  console.log("✓ transition APPROVED ok");

  const historyRequest = new NextRequest(
    `http://localhost/api/saas-product/workflows/${workflowId}/history`,
  );
  const historyResponse = await withApiContext(
    historyRequest,
    (ctx) => handleListWorkflowHistory(ctx, workflowId),
    { requireTenant: true },
  );
  const historyBody = await historyResponse.json();
  assert(historyResponse.status === 200, "list history returns 200");
  assert(historyBody.data?.history?.length > 0, "history count > 0");
  console.log("✓ list workflow history ok");

  const eventsRequest = new NextRequest(
    `http://localhost/api/saas-product/workflows/${workflowId}/events`,
  );
  const eventsResponse = await withApiContext(
    eventsRequest,
    (ctx) => handleListWorkflowEvents(ctx, workflowId),
    { requireTenant: true },
  );
  const eventsBody = await eventsResponse.json();
  assert(eventsResponse.status === 200, "list events returns 200");
  assert(eventsBody.data?.events?.length > 0, "event count > 0");
  console.log("✓ list workflow events ok");

  setRuntimeSession({
    userId: CONTRACTOR_USER_ID,
    email: "pm@contractor.example.com",
  });
  const crossTenantHistoryRequest = new NextRequest(
    `http://localhost/api/saas-product/workflows/${workflowId}/history`,
  );
  const crossTenantHistoryResponse = await withApiContext(
    crossTenantHistoryRequest,
    (ctx) => handleListWorkflowHistory(ctx, workflowId),
    { requireTenant: true },
  );
  const crossTenantHistoryBody = await crossTenantHistoryResponse.json();
  assert(crossTenantHistoryResponse.status === 404, "cross tenant history returns 404");
  assert(crossTenantHistoryBody.ok === false, "cross tenant history body ok=false");
  assert(crossTenantHistoryBody.code === API_ERROR_CODES.API_NOT_FOUND, "cross tenant history code");
  console.log("✓ cross tenant → 404 ok");

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const historyRoutePath = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workflows",
    "[workflowId]",
    "history",
    "route.ts",
  );
  const eventsRoutePath = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workflows",
    "[workflowId]",
    "events",
    "route.ts",
  );
  assertRouteHasNoForbiddenImports(historyRoutePath);
  assertRouteHasNoForbiddenImports(eventsRoutePath);
  const historyLines = readFileSync(historyRoutePath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  const eventsLines = readFileSync(eventsRoutePath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  assert(historyLines.length < 15, "workflow history route stays thin");
  assert(eventsLines.length < 15, "workflow events route stays thin");
  console.log("✓ audit routes boundary ok");

  assert(
    SAAS_PRODUCT_API_META.tag.startsWith("v51-api-exposure-"),
    "API meta tag must remain in v51 exposure lineage",
  );
  assert(SAAS_PRODUCT_API_META.dependencyTag === V50_PERSISTENCE_DEPENDENCY_TAG, "V50 dependency");
  console.log("✓ API meta ok (P6 audit read regression; current meta tag may advance beyond P6)");

  console.log(`tag=${SAAS_PRODUCT_API_P6_TAG}`);
  console.log("V51 P6 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
