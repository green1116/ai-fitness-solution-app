import { existsSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_API_HEALTH_PATH,
  SAAS_PRODUCT_API_P1_TAG,
  SAAS_PRODUCT_API_VERSION,
  V50_PERSISTENCE_DEPENDENCY_TAG,
} from "../shared/api-constants";
import { getPersistenceRuntime } from "../adapter/get-persistence-runtime";
import { handleHealth } from "../handlers/health-handlers";
import type { ApiP1Validation } from "../shared/api-types";

export async function validateApiP1(): Promise<ApiP1Validation> {
  const runtime = getPersistenceRuntime();
  const health = await handleHealth({
    tenantId: null,
    actor: "p1-validator",
    runtime,
    backend: runtime.backend,
  });

  const moduleRoot = join(process.cwd(), "lib", "saas-product-api");
  const routePath = join(process.cwd(), "app", "api", "saas-product", "health", "route.ts");

  const valid =
    existsSync(join(moduleRoot, "shared", "api-types.ts")) &&
    existsSync(join(moduleRoot, "auth", "with-api-context.ts")) &&
    existsSync(join(moduleRoot, "adapter", "get-persistence-runtime.ts")) &&
    existsSync(routePath) &&
    health.ok === true &&
    health.data.tag === SAAS_PRODUCT_API_P1_TAG &&
    health.data.version === SAAS_PRODUCT_API_VERSION &&
    (health.data.backend === "memory" || health.data.backend === "prisma") &&
    health.data.v50Tag === V50_PERSISTENCE_DEPENDENCY_TAG &&
    typeof runtime.workspace.create === "function" &&
    SAAS_PRODUCT_API_HEALTH_PATH === "/api/saas-product/health";

  return {
    valid,
    summary: `p1Tag=${SAAS_PRODUCT_API_P1_TAG} apiShellValid=${valid} backend=${health.data.backend}`,
  };
}
