/**
 * V51 API Exposure — P2 Tenant & Adapter Wiring verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import {
  SAAS_PRODUCT_API_META,
  SAAS_PRODUCT_API_P2_TAG,
  API_ERROR_CODES,
  V50_PERSISTENCE_DEPENDENCY_TAG,
  validateApiP2,
  withApiContext,
  handleMe,
} from "../lib/saas-product-api";

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
  const validation = await validateApiP2();
  assert(validation.valid, `P2 tenant wiring validation: ${validation.summary}`);
  console.log("✓ P2 tenant wiring validation ok");

  clearRuntimeSession();
  const unauthenticatedRequest = new NextRequest("http://localhost/api/saas-product/me");
  const unauthenticatedResponse = await withApiContext(
    unauthenticatedRequest,
    (ctx) => handleMe(ctx),
    { requireTenant: true },
  );
  const unauthenticatedBody = await unauthenticatedResponse.json();
  assert(unauthenticatedResponse.status === 401, "no tenant/session returns 401");
  assert(unauthenticatedBody.ok === false, "unauthenticated body ok=false");
  assert(unauthenticatedBody.code === API_ERROR_CODES.API_UNAUTHORIZED, "unauthenticated code");
  console.log("✓ no tenant → 401 ok");

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const authenticatedRequest = new NextRequest("http://localhost/api/saas-product/me");
  const authenticatedResponse = await withApiContext(
    authenticatedRequest,
    (ctx) => handleMe(ctx),
    { requireTenant: true },
  );
  const authenticatedBody = await authenticatedResponse.json();
  assert(authenticatedResponse.status === 200, "authenticated tenant returns 200");
  assert(authenticatedBody.ok === true, "authenticated body ok=true");
  assert(Boolean(authenticatedBody.data?.tenantId), "authenticated tenantId");
  assert(Boolean(authenticatedBody.data?.userId), "authenticated userId");
  console.log("✓有 tenant → 200 ok");

  clearRuntimeSession();

  const meRoutePath = join(process.cwd(), "app", "api", "saas-product", "me", "route.ts");
  assertRouteHasNoForbiddenImports(meRoutePath);
  const routeLines = readFileSync(meRoutePath, "utf8").split("\n").filter((line) => line.trim().length > 0);
  assert(routeLines.length < 15, "me route stays thin");
  console.log("✓ me route boundary ok");

  assert(
    SAAS_PRODUCT_API_META.tag.startsWith("v51-api-exposure-p"),
    "API meta tag must remain in v51 exposure lineage",
  );
  assert(SAAS_PRODUCT_API_META.dependencyTag === V50_PERSISTENCE_DEPENDENCY_TAG, "V50 dependency");
  console.log("✓ API meta ok (P2 tenant regression; current meta tag may advance beyond P2)");

  console.log(`tag=${SAAS_PRODUCT_API_P2_TAG}`);
  console.log("V51 P2 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
