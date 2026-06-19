/**
 * V51 API Exposure — P5 Workflow API verification
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
  SAAS_PRODUCT_API_P5_TAG,
  V50_PERSISTENCE_DEPENDENCY_TAG,
  resetPersistenceRuntimeForTests,
  validateApiP5,
  withApiContext,
  handleCreateQuote,
  handleCreateWorkspace,
  handleGetWorkflow,
  handleListWorkflows,
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

  const validation = await validateApiP5();
  assert(validation.valid, `P5 workflow API validation: ${validation.summary}`);
  console.log("✓ P5 workflow API validation ok");

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const workspaceName = `verify-v51-p5-workspace-${Date.now()}`;
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
  assert(workspaceResponse.status === 200, "create workspace for workflow test");
  const workspaceId = workspaceBody.data.workspace.id as string;
  console.log("✓ workspace ready for workflow test");

  const quoteTitle = `verify-v51-p5-quote-${Date.now()}`;
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
  const quoteId = createQuoteBody.data.quote.id as string;
  const workflowId = createQuoteBody.data.workflow.id as string;
  console.log("✓ create quote + workflow ok");

  const getWorkflowRequest = new NextRequest(
    `http://localhost/api/saas-product/quotes/${quoteId}/workflow`,
  );
  const getWorkflowResponse = await withApiContext(
    getWorkflowRequest,
    (ctx) => handleGetWorkflow(ctx, quoteId),
    { requireTenant: true },
  );
  const getWorkflowBody = await getWorkflowResponse.json();
  assert(getWorkflowResponse.status === 200, "get workflow returns 200");
  assert(getWorkflowBody.data?.workflow?.id === workflowId, "get workflow id");
  console.log("✓ get workflow ok");

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
  const transitionBody = await transitionResponse.json();
  assert(transitionResponse.status === 200, "transition workflow returns 200");
  assert(transitionBody.data?.workflow?.currentState === "APPROVED", "workflow transitioned");
  assert(transitionBody.data?.history?.toState === "APPROVED", "history recorded");
  assert(transitionBody.data?.event?.eventType === "STATE_CHANGED", "event recorded");
  console.log("✓ transition APPROVED ok");

  const listWorkflowsRequest = new NextRequest(
    `http://localhost/api/saas-product/workflows?workspaceId=${workspaceId}`,
  );
  const listWorkflowsResponse = await withApiContext(
    listWorkflowsRequest,
    (ctx) => handleListWorkflows(ctx, workspaceId),
    { requireTenant: true },
  );
  const listWorkflowsBody = await listWorkflowsResponse.json();
  assert(listWorkflowsResponse.status === 200, "list workflows returns 200");
  assert(
    listWorkflowsBody.data?.workflows?.some(
      (item: { id: string; currentState: string }) =>
        item.id === workflowId && item.currentState === "APPROVED",
    ),
    "list contains transitioned workflow",
  );
  console.log("✓ list workflows ok");

  setRuntimeSession({
    userId: CONTRACTOR_USER_ID,
    email: "pm@contractor.example.com",
  });
  const crossTenantRequest = new NextRequest(
    `http://localhost/api/saas-product/quotes/${quoteId}/workflow`,
  );
  const crossTenantResponse = await withApiContext(
    crossTenantRequest,
    (ctx) => handleGetWorkflow(ctx, quoteId),
    { requireTenant: true },
  );
  const crossTenantBody = await crossTenantResponse.json();
  assert(crossTenantResponse.status === 404, "cross tenant returns 404");
  assert(crossTenantBody.ok === false, "cross tenant body ok=false");
  assert(crossTenantBody.code === API_ERROR_CODES.API_NOT_FOUND, "cross tenant code");
  console.log("✓ cross tenant → 404 ok");

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const quoteWorkflowRoutePath = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "quotes",
    "[quoteId]",
    "workflow",
    "route.ts",
  );
  const workflowsRoutePath = join(process.cwd(), "app", "api", "saas-product", "workflows", "route.ts");
  const transitionRoutePath = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workflows",
    "[workflowId]",
    "transition",
    "route.ts",
  );
  assertRouteHasNoForbiddenImports(quoteWorkflowRoutePath);
  assertRouteHasNoForbiddenImports(workflowsRoutePath);
  assertRouteHasNoForbiddenImports(transitionRoutePath);
  const quoteWorkflowLines = readFileSync(quoteWorkflowRoutePath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  const workflowsLines = readFileSync(workflowsRoutePath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  const transitionLines = readFileSync(transitionRoutePath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  assert(quoteWorkflowLines.length < 15, "quote workflow route stays thin");
  assert(workflowsLines.length < 15, "workflows route stays thin");
  assert(transitionLines.length < 15, "workflow transition route stays thin");
  console.log("✓ workflow routes boundary ok");

  assert(
    SAAS_PRODUCT_API_META.tag.startsWith("v51-api-exposure-"),
    "API meta tag must remain in v51 exposure lineage",
  );
  assert(SAAS_PRODUCT_API_META.dependencyTag === V50_PERSISTENCE_DEPENDENCY_TAG, "V50 dependency");
  console.log("✓ API meta ok (P5 workflow regression; current meta tag may advance beyond P5)");

  console.log(`tag=${SAAS_PRODUCT_API_P5_TAG}`);
  console.log("V51 P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
