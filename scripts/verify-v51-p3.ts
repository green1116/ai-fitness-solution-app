/**
 * V51 API Exposure — P3 Workspace API verification
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
  SAAS_PRODUCT_API_P3_TAG,
  V50_PERSISTENCE_DEPENDENCY_TAG,
  resetPersistenceRuntimeForTests,
  validateApiP3,
  withApiContext,
  handleCreateWorkspace,
  handleGetWorkspace,
  handleListWorkspaces,
  handleUpdateWorkspaceStatus,
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

  const validation = await validateApiP3();
  assert(validation.valid, `P3 workspace API validation: ${validation.summary}`);
  console.log("✓ P3 workspace API validation ok");

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const createRequest = new NextRequest("http://localhost/api/saas-product/workspaces", {
    method: "POST",
    body: JSON.stringify({
      name: "verify-v51-p3-workspace",
      tenantId: "must-be-ignored",
    }),
    headers: { "content-type": "application/json" },
  });
  const createResponse = await withApiContext(
    createRequest,
    async (ctx) => handleCreateWorkspace(ctx, await createRequest.json()),
    { requireTenant: true },
  );
  const createBody = await createResponse.json();
  assert(createResponse.status === 200, "create workspace returns 200");
  assert(createBody.ok === true, "create body ok=true");
  assert(createBody.data?.workspace?.tenantId === "tenant-mock-enterprise", "ctx tenantId enforced");
  const workspaceId = createBody.data.workspace.id as string;
  console.log("✓ create workspace ok");

  const listRequest = new NextRequest("http://localhost/api/saas-product/workspaces");
  const listResponse = await withApiContext(
    listRequest,
    (ctx) => handleListWorkspaces(ctx),
    { requireTenant: true },
  );
  const listBody = await listResponse.json();
  assert(listResponse.status === 200, "list workspaces returns 200");
  assert(
    listBody.data?.workspaces?.some((item: { id: string }) => item.id === workspaceId),
    "list contains created workspace",
  );
  console.log("✓ list workspaces ok");

  const getRequest = new NextRequest(`http://localhost/api/saas-product/workspaces/${workspaceId}`);
  const getResponse = await withApiContext(
    getRequest,
    (ctx) => handleGetWorkspace(ctx, workspaceId),
    { requireTenant: true },
  );
  const getBody = await getResponse.json();
  assert(getResponse.status === 200, "get workspace returns 200");
  assert(getBody.data?.workspace?.id === workspaceId, "get workspace id");
  console.log("✓ get workspace ok");

  const archiveRequest = new NextRequest(`http://localhost/api/saas-product/workspaces/${workspaceId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "ARCHIVED", tenantId: "must-be-ignored" }),
    headers: { "content-type": "application/json" },
  });
  const archiveResponse = await withApiContext(
    archiveRequest,
    async (ctx) => handleUpdateWorkspaceStatus(ctx, workspaceId, await archiveRequest.json()),
    { requireTenant: true },
  );
  const archiveBody = await archiveResponse.json();
  assert(archiveResponse.status === 200, "archive workspace returns 200");
  assert(archiveBody.data?.workspace?.status === "ARCHIVED", "archived status");
  console.log("✓ archive workspace ok");

  setRuntimeSession({
    userId: CONTRACTOR_USER_ID,
    email: "pm@contractor.example.com",
  });
  const crossTenantRequest = new NextRequest(`http://localhost/api/saas-product/workspaces/${workspaceId}`);
  const crossTenantResponse = await withApiContext(
    crossTenantRequest,
    (ctx) => handleGetWorkspace(ctx, workspaceId),
    { requireTenant: true },
  );
  const crossTenantBody = await crossTenantResponse.json();
  assert(crossTenantResponse.status === 404, "cross tenant returns 404");
  assert(crossTenantBody.ok === false, "cross tenant body ok=false");
  assert(crossTenantBody.code === API_ERROR_CODES.API_NOT_FOUND, "cross tenant code");
  console.log("✓ cross tenant → 404 ok");

  clearRuntimeSession();
  resetPersistenceRuntimeForTests();

  const workspacesRoutePath = join(process.cwd(), "app", "api", "saas-product", "workspaces", "route.ts");
  const workspaceItemRoutePath = join(
    process.cwd(),
    "app",
    "api",
    "saas-product",
    "workspaces",
    "[workspaceId]",
    "route.ts",
  );
  assertRouteHasNoForbiddenImports(workspacesRoutePath);
  assertRouteHasNoForbiddenImports(workspaceItemRoutePath);
  const collectionLines = readFileSync(workspacesRoutePath, "utf8").split("\n").filter((line) => line.trim().length > 0);
  const itemLines = readFileSync(workspaceItemRoutePath, "utf8").split("\n").filter((line) => line.trim().length > 0);
  assert(collectionLines.length < 15, "workspaces collection route stays thin");
  assert(itemLines.length < 15, "workspace item route stays thin");
  console.log("✓ workspace routes boundary ok");

  assert(
    SAAS_PRODUCT_API_META.tag.startsWith("v51-api-exposure-p"),
    "API meta tag must remain in v51 exposure lineage",
  );
  assert(SAAS_PRODUCT_API_META.dependencyTag === V50_PERSISTENCE_DEPENDENCY_TAG, "V50 dependency");
  console.log("✓ API meta ok (P3 workspace regression; current meta tag may advance beyond P3)");

  console.log(`tag=${SAAS_PRODUCT_API_P3_TAG}`);
  console.log("V51 P3 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
