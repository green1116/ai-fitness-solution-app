/**
 * V51 API Exposure — P1 API Shell Foundation verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_API_META,
  SAAS_PRODUCT_API_P1_TAG,
  validateApiP1,
  getPersistenceRuntime,
  handleHealth,
  V50_PERSISTENCE_DEPENDENCY_TAG,
} from "../lib/saas-product-api";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertRouteHasNoForbiddenImports(routePath: string) {
  const content = readFileSync(routePath, "utf8");
  assert(!content.includes("@/lib/prisma"), `${routePath} must not import prisma`);
  assert(!content.includes("lib/saas-product/"), `${routePath} must not import V49 runtime`);
  assert(!content.includes("createQuoteWorkflow"), `${routePath} must not import V49 workflow`);
}

async function main() {
  const validation = await validateApiP1();
  assert(validation.valid, `P1 API shell validation: ${validation.summary}`);
  console.log("✓ P1 API shell validation ok");

  const runtime = getPersistenceRuntime();
  assert(runtime.backend === "memory" || runtime.backend === "prisma", "persistence runtime backend");
  console.log("✓ persistence runtime adapter ok");

  const health = await handleHealth({
    tenantId: null,
    actor: "verify-user",
    runtime,
    backend: runtime.backend,
  });
  assert(health.data.ok === true, "health ok flag");
  assert(health.data.tag === SAAS_PRODUCT_API_P1_TAG, "health tag");
  assert(health.data.v50Tag === V50_PERSISTENCE_DEPENDENCY_TAG, "health v50 dependency tag");
  console.log("✓ health handler ok");

  const routePath = join(process.cwd(), "app", "api", "saas-product", "health", "route.ts");
  assertRouteHasNoForbiddenImports(routePath);
  const routeLines = readFileSync(routePath, "utf8").split("\n").filter((line) => line.trim().length > 0);
  assert(routeLines.length < 15, "health route stays thin");
  console.log("✓ health route boundary ok");

  assert(
    SAAS_PRODUCT_API_META.tag.startsWith("v51-api-exposure-"),
    "API meta tag must remain in v51 exposure lineage",
  );
  assert(SAAS_PRODUCT_API_META.dependencyTag === V50_PERSISTENCE_DEPENDENCY_TAG, "V50 dependency");
  console.log("✓ API meta ok (P1 shell regression; current meta tag may advance beyond P1)");

  console.log(`tag=${SAAS_PRODUCT_API_P1_TAG}`);
  console.log("V51 P1 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
