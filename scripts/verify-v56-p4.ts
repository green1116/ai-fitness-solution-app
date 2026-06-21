/**
 * V56 Quote Runtime Integration — P4 Quote API Adapter verification
 */
import { existsSync } from "fs";
import { join } from "path";
import {
  V56_QUOTE_P4_VERIFY_CHECKS,
  WORKSPACE_QUOTE_INTEGRATION_P4_META,
  WORKSPACE_QUOTE_INTEGRATION_P4_TAG,
} from "@/lib/quote-runtime-integration/freeze/v56-p4-meta";
import { WORKSPACE_QUOTE_INTEGRATION_P4_FREEZE } from "@/lib/quote-runtime-integration/freeze/v56-p4-final";
import {
  SAAS_PRODUCT_API_DEPENDENCY_TAG,
  WORKSPACE_QUOTE_INTEGRATION_P3_TAG,
} from "@/lib/quote-runtime-integration/shared/integration-constants";
import {
  assertAdapterUsesV51ExposureNotHandlers,
  assertApiAdapterContract,
  assertApiBindingContract,
  assertHasApiAdapter,
  assertMountedQuoteApiAdapter,
  assertP4NoDirectApiHandler,
  assertP4NoDirectRouteAccess,
  assertP4NoWorkflowExecution,
  assertPortEnforcedApiContract,
  validateQuoteIntegrationP4,
} from "@/lib/quote-runtime-integration/validation/quote-api.verify";

const INTEGRATION_ROOT = join(process.cwd(), "lib", "quote-runtime-integration");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateQuoteIntegrationP4();
  assert(validation.valid, `P4 quote api adapter validation: ${validation.summary}`);
  console.log("✓ P4 quote api adapter validation ok");

  assert(existsSync(join(INTEGRATION_ROOT, "adapters", "api", "quote-api.adapter.ts")), "api adapter module");
  assert(assertApiAdapterContract(), "HAS_API_ADAPTER");
  assert(assertHasApiAdapter(), "api adapter mounted");
  console.log("✓ HAS_API_ADAPTER");

  assert(existsSync(join(INTEGRATION_ROOT, "adapters", "api", "quote-api-binding.ts")), "api binding module");
  assert(assertApiBindingContract(), "HAS_API_BINDING");
  assert(assertAdapterUsesV51ExposureNotHandlers(), "v51 exposure binding");
  console.log("✓ HAS_API_BINDING");

  assert(assertPortEnforcedApiContract(), "PORT_ENFORCED_API");
  assert(assertMountedQuoteApiAdapter(), "port enforced api mounted");
  console.log("✓ PORT_ENFORCED_API");

  assert(assertP4NoDirectApiHandler(), "NO_DIRECT_API_HANDLER");
  console.log("✓ NO_DIRECT_API_HANDLER");

  assert(assertP4NoDirectRouteAccess(), "NO_DIRECT_ROUTE_ACCESS");
  console.log("✓ NO_DIRECT_ROUTE_ACCESS");

  assert(assertP4NoWorkflowExecution(), "NO_WORKFLOW_EXECUTION");
  console.log("✓ NO_WORKFLOW_EXECUTION");

  assert(WORKSPACE_QUOTE_INTEGRATION_P4_META.tag === WORKSPACE_QUOTE_INTEGRATION_P4_TAG, "p4 meta tag");
  assert(WORKSPACE_QUOTE_INTEGRATION_P4_META.phase === "v56-quote-runtime-p4", "p4 meta phase");
  assert(WORKSPACE_QUOTE_INTEGRATION_P4_META.dependencyTag === WORKSPACE_QUOTE_INTEGRATION_P3_TAG, "p4 dependency tag");
  assert(
    WORKSPACE_QUOTE_INTEGRATION_P4_META.upstreamDependencyTag === SAAS_PRODUCT_API_DEPENDENCY_TAG,
    "p4 upstream dependency",
  );
  assert(WORKSPACE_QUOTE_INTEGRATION_P4_FREEZE.status === "quote-api-adapter", "p4 freeze status");
  assert(V56_QUOTE_P4_VERIFY_CHECKS.includes("HAS_API_ADAPTER"), "p4 verify checks");
  console.log("✓ quote p4 meta ok");

  console.log(`tag=${WORKSPACE_QUOTE_INTEGRATION_P4_TAG}`);
  console.log(`dependency=${WORKSPACE_QUOTE_INTEGRATION_P3_TAG}`);
  console.log(`upstream=${SAAS_PRODUCT_API_DEPENDENCY_TAG}`);
  console.log("V56 P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
