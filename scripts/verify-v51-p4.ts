/**
 * V51 API Exposure — P4 Quote API verification
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
  SAAS_PRODUCT_API_P4_TAG,
  V50_PERSISTENCE_DEPENDENCY_TAG,
  resetPersistenceRuntimeForTests,
  validateApiP4,
  withApiContext,
  handleCreateQuote,
  handleCreateWorkspace,
  handleGetQuote,
  handleListQuotes,
  handleUpdateQuote,
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

  const validation = await validateApiP4();
  assert(validation.valid, `P4 quote API validation: ${validation.summary}`);
  console.log("✓ P4 quote API validation ok");

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const workspaceName = `verify-v51-p4-workspace-${Date.now()}`;
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
  assert(workspaceResponse.status === 200, "create workspace for quote test");
  const workspaceId = workspaceBody.data.workspace.id as string;
  console.log("✓ workspace ready for quote test");

  const quoteTitle = `verify-v51-p4-quote-${Date.now()}`;
  const createRequest = new NextRequest(
    `http://localhost/api/saas-product/workspaces/${workspaceId}/quotes`,
    {
      method: "POST",
      body: JSON.stringify({ title: quoteTitle, tenantId: "must-be-ignored" }),
      headers: { "content-type": "application/json" },
    },
  );
  const createResponse = await withApiContext(
    createRequest,
    async (ctx) => handleCreateQuote(ctx, workspaceId, await createRequest.json()),
    { requireTenant: true },
  );
  const createBody = await createResponse.json();
  assert(createResponse.status === 200, "create quote returns 200");
  assert(createBody.ok === true, "create quote body ok=true");
  assert(createBody.data?.quote?.tenantId === "tenant-mock-enterprise", "quote tenantId from ctx");
  assert(createBody.data?.workflow?.quoteId === createBody.data?.quote?.id, "workflow bound to quote");
  const quoteId = createBody.data.quote.id as string;
  console.log("✓ create quote ok");

  const listRequest = new NextRequest(
    `http://localhost/api/saas-product/workspaces/${workspaceId}/quotes`,
  );
  const listResponse = await withApiContext(
    listRequest,
    (ctx) => handleListQuotes(ctx, workspaceId),
    { requireTenant: true },
  );
  const listBody = await listResponse.json();
  assert(listResponse.status === 200, "list quotes returns 200");
  assert(
    listBody.data?.quotes?.some((item: { id: string }) => item.id === quoteId),
    "list contains created quote",
  );
  console.log("✓ list quotes ok");

  const getRequest = new NextRequest(`http://localhost/api/saas-product/quotes/${quoteId}`);
  const getResponse = await withApiContext(
    getRequest,
    (ctx) => handleGetQuote(ctx, quoteId),
    { requireTenant: true },
  );
  const getBody = await getResponse.json();
  assert(getResponse.status === 200, "get quote returns 200");
  assert(getBody.data?.quote?.id === quoteId, "get quote id");
  console.log("✓ get quote ok");

  const updateRequest = new NextRequest(`http://localhost/api/saas-product/quotes/${quoteId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "APPROVED", tenantId: "must-be-ignored" }),
    headers: { "content-type": "application/json" },
  });
  const updateResponse = await withApiContext(
    updateRequest,
    async (ctx) => handleUpdateQuote(ctx, quoteId, await updateRequest.json()),
    { requireTenant: true },
  );
  const updateBody = await updateResponse.json();
  assert(updateResponse.status === 200, "update quote returns 200");
  assert(updateBody.data?.quote?.status === "APPROVED", "quote status updated");
  console.log("✓ update quote status ok");

  setRuntimeSession({
    userId: CONTRACTOR_USER_ID,
    email: "pm@contractor.example.com",
  });
  const crossTenantRequest = new NextRequest(`http://localhost/api/saas-product/quotes/${quoteId}`);
  const crossTenantResponse = await withApiContext(
    crossTenantRequest,
    (ctx) => handleGetQuote(ctx, quoteId),
    { requireTenant: true },
  );
  const crossTenantBody = await crossTenantResponse.json();
  assert(crossTenantResponse.status === 404, "cross tenant returns 404");
  assert(crossTenantBody.ok === false, "cross tenant body ok=false");
  assert(crossTenantBody.code === API_ERROR_CODES.API_NOT_FOUND, "cross tenant code");
  console.log("✓ cross tenant → 404 ok");

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const quotesCollectionRoutePath = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workspaces",
    "[workspaceId]",
    "quotes",
    "route.ts",
  );
  const quoteItemRoutePath = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "quotes",
    "[quoteId]",
    "route.ts",
  );
  assertRouteHasNoForbiddenImports(quotesCollectionRoutePath);
  assertRouteHasNoForbiddenImports(quoteItemRoutePath);
  const collectionLines = readFileSync(quotesCollectionRoutePath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  const itemLines = readFileSync(quoteItemRoutePath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  assert(collectionLines.length < 15, "workspace quotes route stays thin");
  assert(itemLines.length < 15, "quote item route stays thin");
  console.log("✓ quote routes boundary ok");

  assert(
    SAAS_PRODUCT_API_META.tag.startsWith("v51-api-exposure-"),
    "API meta tag must remain in v51 exposure lineage",
  );
  assert(SAAS_PRODUCT_API_META.dependencyTag === V50_PERSISTENCE_DEPENDENCY_TAG, "V50 dependency");
  console.log("✓ API meta ok (P4 quote regression; current meta tag may advance beyond P4)");

  console.log(`tag=${SAAS_PRODUCT_API_P4_TAG}`);
  console.log("V51 P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
